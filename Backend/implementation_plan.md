# Seller Activity & Operations Implementation Plan

This document outlines the approach for building out the Seller Activity & Operations endpoints as specified in the updated `task.md`. The implementation will provide sellers with comprehensive management capabilities for their products, stock, orders, and profile, strictly scoped to their own data.

## User Review Required

> [!IMPORTANT]
> **Order Status for Multi-Seller Orders:**
> The requirement states that "orders containing items from multiple sellers are sliced per seller". Currently, the `Order` model has a global `status` field, but no status on individual `OrderItem`s. If one order contains items from Seller A and Seller B, and Seller A ships their item, updating the global order status to `shipped` would incorrectly imply Seller B also shipped their item. 
> 
> **Proposed Solution:** I propose adding a `status` field (using the `OrderStatus` enum) directly to the `OrderItem` model. This allows each seller to manage the status of their specific items independently. The global order status can either be computed based on the items or left as a high-level summary. **Please confirm if this approach is acceptable.**



## Proposed Changes

---

### Models Layer

#### [MODIFY] `app/models/product_model.py`
- Add `ProductStockUpdate` model for `PATCH /seller/products/{product_id}/stock`.
- Add `ProductToggleRequest` (or just expect a query param/simple body) for `PATCH /seller/products/{product_id}/toggle`.

#### [MODIFY] `app/models/orders_model.py`
- Add `status: OrderStatus = OrderStatus.pending` to `OrderItem`.
- Add a new `SellerOrderResponse` model that masks sensitive buyer information (only exposing `name` and `shipping_address`, hiding `mobile`) and includes only the items belonging to the current seller, along with a computed `seller_total`.
- Add `OrderItemStatusUpdate` model for the order status update endpoint.

---

### Repository Layer

#### [NEW/MODIFY] `app/repo/seller_helpers.py` (or dedicated product/order helpers)
- **Product DB Operations:**
  - `insert_seller_product(product_data)`
  - `get_seller_products(seller_id, filters)`
  - `update_seller_product(product_id, seller_id, update_data)`
  - `soft_delete_seller_product(product_id, seller_id)`
- **Order DB Operations:**
  - `get_seller_orders(seller_id, filters)`: MongoDB aggregation to fetch orders where `items.seller_id` matches the user, projecting only relevant fields and slicing the items array.
  - `update_seller_order_item_status(order_id, seller_id, new_status)`: Updates the status of specific items inside the order's `items` array.
- **Dashboard Operations:**
  - `get_seller_dashboard_stats(seller_id)`: Perform aggregations to get product counts (active, pending, low stock), order counts by status, and calculate revenue (all time, this month, this week).

---

### Service Layer

#### [MODIFY] `app/services/seller_service.py`
Implement the business logic, enforcing the ownership scope (`seller_id` injected from JWT) on every operation.

- **Product Management:**
  - `create_product`: Injects `seller_id`, sets `is_approved=False`.
  - `get_products` / `get_product_by_id`: Enforces `seller_id` match.
  - `update_product`: Strips restricted fields (`is_approved`, `seller_id`, `avg_rating`, `review_count`).
  - `toggle_product`: Flips `is_active`.
  - `update_stock`: Updates stock level, validates non-negative.
  - `delete_product`: Soft delete by setting `is_active=False` and potentially `status="deleted"`.

- **Order Management:**
  - `get_orders` / `get_order_by_id`: Uses the repository helper to slice the order and return the masked `SellerOrderResponse`.
  - `update_order_status`: Validates valid transitions (confirmed -> shipped -> delivered). Updates the status of the specific `OrderItem`s for that seller.

- **Profile & Dashboard:**
  - `update_profile`: PAN.
  - `get_dashboard`: Aggregates the statistics from products, orders, and the seller profile.

---

### Routing Layer

#### [MODIFY] `app/routes/seller_routes.py`
Add the following endpoints protected by `require_permission()` dependencies:

- **Profile:**
  - `GET /seller/profile` (`seller_profile:own:write`)
  - `PUT /seller/profile` (`seller_profile:own:write`)

- **Products:**
  - `POST /seller/products` (`product:own:write`)
  - `GET /seller/products` (`product:own:write`)
  - `GET /seller/products/{product_id}` (`product:own:write`)
  - `PUT /seller/products/{product_id}` (`product:own:write`)
  - `PATCH /seller/products/{product_id}/toggle` (`product:own:write`)
  - `PATCH /seller/products/{product_id}/stock` (`product:own:write`)
  - `DELETE /seller/products/{product_id}` (`product:own:delete`)

- **Orders:**
  - `GET /seller/orders` (`order:own:view`)
  - `GET /seller/orders/{order_id}` (`order:own:view`)
  - `PATCH /seller/orders/{order_id}/status` (`order:own:status:update`)

- **Dashboard:**
  - `GET /seller/dashboard` (`product:own:write` as gate)

## Verification Plan

### Automated/Manual Verification
- **Product Scope:** Test that a seller cannot view or edit a product belonging to another seller (returns 404).
- **Security:** Ensure `seller_id` cannot be overridden via `POST` or `PUT` product payload. Check that `is_approved` stays `False` on creation and cannot be updated by the seller.
- **Order Slicing:** Create an order with items from Seller A and Seller B. Log in as Seller A and verify that only Seller A's items are visible in the order detail endpoint, and buyer's email/mobile are masked.
- **Order Status:** Ensure Seller A can only update the status of their own items in the order, following the state machine rules.
- **Error Handling:** All missing or out-of-scope resources should return `404 Not Found`.
