from app.models.orders_model import OrderStatus, ItemStatus
import re

def generate_slug(name: str) -> str:
    # Convert to lowercase and replace non-alphanumeric characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return slug

def compute_order_status(items: list) -> OrderStatus:
    if not items:
        return OrderStatus.pending

    # Extract all unique statuses
    item_statuses = {item.get("item_status") for item in items}
    
    # 1. Terminal case: All items are cancelled
    if item_statuses == {ItemStatus.cancelled}:
        return OrderStatus.cancelled
        
    # 2. Consider only non-cancelled items for forward progress
    active_statuses = {s for s in item_statuses if s != ItemStatus.cancelled}
    if not active_statuses:
        return OrderStatus.cancelled

    # 3. Hierarchical status determination
    # Check for Delivered
    if ItemStatus.delivered in active_statuses:
        if active_statuses == {ItemStatus.delivered}:
            return OrderStatus.delivered
        return OrderStatus.partially_delivered
        
    # Check for Shipped
    if ItemStatus.shipped in active_statuses:
        if active_statuses == {ItemStatus.shipped}:
            return OrderStatus.shipped
        return OrderStatus.partially_shipped
        
    # Check for Confirmed
    if ItemStatus.confirmed in active_statuses:
        if active_statuses == {ItemStatus.confirmed}:
            return OrderStatus.confirmed
        # If some are confirmed and some are pending
        return OrderStatus.pending
        
    return OrderStatus.pending

VALID_TRANSITION: dict[str, list[str]] = {
    ItemStatus.confirmed: [ItemStatus.shipped, ItemStatus.cancelled],
    ItemStatus.shipped: [ItemStatus.delivered],
    ItemStatus.delivered: [],
    ItemStatus.cancelled: [],
    ItemStatus.pending:[ItemStatus.confirmed,ItemStatus.cancelled]
}

