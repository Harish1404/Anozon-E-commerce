Requirement Story — Cart Summary & Order Management (User)

Context
User can manage their cart, view a calculated summary with GST and delivery charges, place an order from their cart, track order status, and cancel orders in pending state. No payment processing involved — order placement is a direct confirm action. Seller updates the order status after placement.

Cart Summary Design
Before jumping to orders, the cart needs a calculated summary endpoint. Right now you have the four cart endpoints but no total calculation. This needs to be part of the cart response itself — not a separate endpoint.
How charges are calculated:
subtotal        =  sum of (item.price × item.quantity)

delivery_charge =  if subtotal >= 500  →  0      (free delivery)
                   if subtotal < 500   →  50     (flat charge)

gst_rate        =  18%
gst_amount      =  subtotal × 0.18

total           =  subtotal + delivery_charge + gst_amount
These values are computed on the fly when cart is fetched — never stored in the cart document. Cart document stores only items. Summary is always calculated fresh so price changes reflect immediately.
Cart response shape:
{
  "items": [
    {
      "product_id": str,
      "name": str,
      "image": str,
      "price": float,         ← price at time of adding to cart
      "quantity": int,
      "item_total": float     ← price × quantity
    }
  ],
  "summary": {
    "item_count": int,        ← total number of distinct items
    "subtotal": float,
    "gst_rate": 18,
    "gst_amount": float,
    "delivery_charge": float,
    "free_delivery_eligible": bool,
    "total": float
  }
}

Updated Cart Endpoints
Existing four endpoints stay as is. Only the GET response shape changes to include summary.
MethodEndpointDescriptionGET/users/cartGet cart with live calculated summaryPOST/users/cartAdd product to cartPUT/users/cartUpdate item quantityDELETE/users/cart/{product_id}Remove item from cart
Add to cart behavior:

If product already in cart → increment quantity, do not create duplicate entry
If product is out of stock → 400 "Product is out of stock"
If product is not approved or not active → 400 "Product not available"
Price snapshot taken at time of adding — stored in cart item

Update cart behavior:

Quantity update only — cannot change product via PUT
If quantity set to zero → remove item from cart automatically
Quantity cannot be negative


Place Order Flow
User clicks Place Order
        │
        ├── Cart must not be empty → 400 "Cart is empty"
        │
        ├── Re-validate each item in cart
        │       ├── Product still exists
        │       ├── Product is_approved and is_active
        │       └── Product stock >= requested quantity
        │             └── If any item fails → 400 with specific product name
        │
        ├── User must have at least one address in profile
        │       └── No address → 400 "Add a delivery address first"
        │
        ├── User selects delivery address from their saved addresses
        │
        ├── Snapshot taken at order time
        │       ├── Items — name, image, price, quantity all copied
        │       ├── Shipping address — full address copied
        │       └── Prices frozen — future price changes don't affect order
        │
        ├── Stock decremented for each product
        │       product.stock -= ordered_quantity
        │
        ├── Summary calculated and stored on order
        │       subtotal, gst_amount, delivery_charge, total
        │
        ├── Order document created
        │       status: "pending"
        │       payment_status: "pending"
        │
        └── Cart cleared after successful order placement

Order Status Lifecycle
pending
  │
  └── confirmed        ← seller confirms
        │
        └── shipped    ← seller dispatches
              │
              └── delivered   ← seller marks delivered


pending  →  cancelled  ← user cancels (only in pending state)
User can only cancel when status is pending. Once seller confirms, user cannot cancel.

Order Tracking — What User Sees
User sees the full order from their perspective — all items, full summary, current status.
{
  "order_id": str,
  "status": str,
  "placed_at": datetime,
  "items": [
    {
      "product_id": str,
      "name": str,
      "image": str,
      "price": float,
      "quantity": int,
      "item_total": float
    }
  ],
  "shipping_address": {
    "full_name": str,
    "line1": str,
    "line2": str,
    "city": str,
    "state": str,
    "pincode": str,
    "mobile": str
  },
  "summary": {
    "subtotal": float,
    "gst_rate": 18,
    "gst_amount": float,
    "delivery_charge": float,
    "total": float
  },
  "payment_status": str,
  "payment_method": str
}

Order Endpoints — User
MethodEndpointDescriptionPOST/users/ordersPlace order from cartGET/users/ordersList all own ordersGET/users/orders/{order_id}Single order detail with full trackingPATCH/users/orders/{order_id}/cancelCancel order — pending status only
Query filters on order list:
status — filter by order status
date_from and date_to — date range

Place Order Request Body
{
  "address_id": str    ← must be one of user's saved addresses
}
That is the only input needed. Everything else comes from the cart and the user's profile.

Cancel Order Flow
User requests cancel
        │
        ├── Order belongs to user → ownership check
        │
        ├── Order status is "pending" → allowed
        │       status → "cancelled"
        │       Stock restored for each item
        │           product.stock += cancelled_quantity
        │
        └── Order status is anything else → 400
                "Order cannot be cancelled after confirmation"
Stock is restored on cancellation so the product becomes available again for other buyers.

Validation Rules
Place order:

Cart cannot be empty
All products must be approved, active, and in sufficient stock
Address ID must belong to the requesting user
Address must exist in user's profile addresses array

Cancel order:

Order must belong to the requesting user
Status must be pending — no exceptions

Cart operations:

Product must exist, be approved, and be active to add to cart
Quantity must be a positive integer
Quantity cannot exceed available stock at time of adding


Stock Handling Summary
EventStock ChangeAdd to cartNo change — cart does not reserve stockPlace orderStock decremented per itemCancel orderStock restored per itemSeller marks deliveredNo change
Stock is not reserved at cart time — only decremented when order is placed. If two users add the same item to cart and one places the order first, the stock check at order placement catches the shortage for the second user.

Error Responses
ScenarioStatusMessageCart is empty400Your cart is emptyProduct out of stock at order time400{product name} is out of stockInsufficient stock at order time400Only {n} units of {product name} availableProduct unavailable at order time400{product name} is no longer availableNo delivery address400Add a delivery address before placing an orderInvalid address ID400Selected address not foundCancel non-pending order400Order cannot be cancelled after confirmationOrder not found404Order not found