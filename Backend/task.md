context: user must have address and profiles done and also mention the payment Type we haven't implemented payments but still he can simpley choose that and after order placed product can updated to paid and address id is good so that we can choose differnt address to ship the product , mention address id 

Also order can also be placed using a product not only from cart coz in product we're gonna have buy now button too so if he clicks still he should abe to able to buy that only product 

And for sellers end if user placed an order from cart some items will arive first and other will take time so seller should should clicks the order and update the status accrodingly so write this logic and if its only one product he can update for that alone and user track everything about his product 

User can see this order history with products which he brought already and give reviews for that i hope this is already there ig I'm not sure about this can you check and confirm



Here is the **high-level technical design** for the Order Workflow, written in a way that bridges the gap between the current implemented code (FastAPI + MongoDB) and the advanced features you require.

### 1. Payment Type Selection
- **Current Status**: The frontend can already select `COD` or `Online`.
- **Implementation Task**:
    - In the frontend's **Cart/Checkout** page, add a field for `payment_method`.
    - Ensure the backend receives this value in the `PlaceOrderRequest`.
    - In the backend service (`order_service.py`), map this to the `Order` schema's `payment_method` field.
    - **Note**: Since payment integration is pending, you can default `payment_status` to `pending` if `COD`, or handle the placeholder logic if `Online`.

### 2. Order Placement from Product Page (Buy Now)
- **Goal**: Users can buy a single product directly from the product detail page without using the cart.
- **Implementation Task**:
    - Create a new endpoint, e.g., `POST /orders/buy-now`.
    - **Logic**:
        1.  Receive `product_id` and `quantity` from the frontend.
        2.  **Create a Temporary Cart**: Temporarily add the product to a new cart instance for this user.
        3.  Call the existing `place_order` logic (which handles address validation and summary calculation) using this temporary cart.
        4.  **Alternative Logic**: Or, you can duplicate the logic from `place_order` but ensure it only processes the single item and calculates the summary accordingly.
    - **Schema**: The `OrderItem` should be created with the exact data from the product at the time of purchase (snapshot).
    - **Update Product**: The "Buy Now" action must decrement stock and update popularity (likes) just like adding from the cart.

### 3. Seller Order Management & Status Updates
- **Context**: Orders can be multi-seller. A seller should only see and manage their own items.
- **Implementation Task**:
    - **Order Slicing**: When an order is created, your `place_order` service should iterate through `cart.items` and "slice" them into `SellerOrder` documents (or add `seller_id` to `OrderItem`).
    - **Seller Dashboard**: Fetch orders where the logged-in seller's ID matches `OrderItem.seller_id`.
    - **Status Update**: Create an endpoint like `POST /seller/orders/{order_item_id}/status`.
    - **Logic**:
        1.  **Atomic Update**: Use a MongoDB transaction or atomic update to modify the specific `OrderItem`'s status.
        2.  **Inventory Check (Crucial)**:
            - If status changes to **`shipped`**: Ensure stock is permanently deducted (if not already done).
            - If status changes to **`delivered`**: Logic is complete.
            - **If status changes back to `cancelled` (by seller)**:
                - The stock for that item MUST be **restored** to the `Products` collection.
                - *Note*: You already have this logic for the user-initiated cancellation, ensure the seller can do it too.
    - **User Tracking**: Update the `OrderItem` status in the main `Orders` collection in real-time so the user sees "Item is being packed" or "Order Shipped" (which might be handled by a different seller).

### 4. Cart Order Cleanup
- **Goal**: Empty the user's cart after a successful order.
- **Implementation Task**:
    - In your `place_order` services, after the order is successfully committed to the database, add a step to delete all items from the user's cart.
    - Use `db.cart.delete_many({"user_id": user_id})`.
