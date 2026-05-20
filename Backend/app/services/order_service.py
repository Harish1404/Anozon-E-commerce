from fastapi import HTTPException
from bson import ObjectId
from app.repo.cart_helpers import clear_user_cart
from app.repo.product_helpers import fetch_product_by_id, decrement_product_stock, increment_product_stock
from app.repo.profiles_helpers import get_profile_by_user_id
from app.repo.orders_helpers import create_order_in_db, get_user_orders_from_db, get_order_by_id_db, update_order_status_db
from app.db.mongodb import cart_collection, products_collection, profiles_collection, orders_collection
from app.services.user_service import UserService
from app.models.orders_model import OrderStatus, ItemStatus, PaymentStatus, PaymentMethod
from app.utils.order_utils import compute_order_status
from app.core.time_utils import utc_now
import logging
from datetime import datetime
from typing import Optional


logger = logging.getLogger("uvicorn.error")

class OrderService:

    @staticmethod
    async def _check_profile_complete(user_id: str):
        """Ensures user has completed their profile before placing an order."""
        profile = await get_profile_by_user_id(profiles_collection(), user_id)
        if not profile:
            raise HTTPException(status_code=422, detail={
                "message": "Please complete your profile before placing an order",
                "code": "PROFILE_INCOMPLETE",
                "missing_fields": ["full_name", "mobile"],
                "has_address": False,
                "redirect": "/profile/complete"
            })

        missing = []
        if not profile.get("full_name"):
            missing.append("full_name")
        if not profile.get("mobile"):
            missing.append("mobile")

        has_address = bool(profile.get("addresses"))

        if missing or not has_address:
            raise HTTPException(status_code=422, detail={
                "message": "Please complete your profile before placing an order",
                "code": "PROFILE_INCOMPLETE",
                "missing_fields": missing,
                "has_address": has_address,
                "redirect": "/profile/complete"
            })

        return profile

    @staticmethod
    async def place_order(user_id: str, address_id: str, payment_method: PaymentMethod = PaymentMethod.cod):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")

        # 0. Profile completeness gate
        profile = await OrderService._check_profile_complete(user_id)

        # 1. Fetch calculated cart
        cart_response = await UserService.get_calculated_cart(user_id, cart_collection())
        
        all_items = cart_response.get("items", [])
        # Filter out unavailable items — only order available ones
        items = [item for item in all_items if item.get("available", True)]
        if not items:
            raise HTTPException(status_code=400, detail="Your cart is empty or all items are unavailable")

        # 2. Re-validate each available item AND cache products
        product_cache = {}
        for item in items:
            product = await fetch_product_by_id(products_collection(), item["product_id"])
            if not product or not product.get("is_active") or not product.get("is_approved"):
                raise HTTPException(status_code=400, detail=f"{item['name']} is no longer available")
            if product.get("stock", 0) < item["quantity"]:
                raise HTTPException(status_code=400, detail=f"Only {product.get('stock', 0)} units of {item['name']} available")
            product_cache[item["product_id"]] = product

        # 3. Fetch address from user profile (profile already fetched in gate)
        if not profile.get("addresses"):
            raise HTTPException(status_code=400, detail="Add a delivery address before placing an order")

        address = next((addr for addr in profile.get("addresses", []) if addr["address_id"] == address_id), None)
        if not address:
            raise HTTPException(status_code=400, detail="Selected address not found")

        # 4. Prepare Order Document (reuse cached products)
        order_items = []
        subtotal = 0.0
        for item in items:
            product = product_cache[item["product_id"]]
            item_total = item["price"] * item["quantity"]
            subtotal += item_total
            order_items.append({
                "product_id": ObjectId(item["product_id"]),
                "seller_id": ObjectId(product.get("seller_id")),
                "name": item["name"],
                "image": item["image"],
                "price": item["price"],
                "quantity": item["quantity"],
                "item_total": item_total,
                "item_status": ItemStatus.pending.value
            })

        # Recalculate summary from available items only
        delivery_charge = 0.0 if subtotal >= 500.0 else 50.0
        if subtotal == 0:
            delivery_charge = 0.0
        gst_amount = round(subtotal * 0.18, 2)
        total = round(subtotal + delivery_charge + gst_amount, 2)

        order_summary = {
            "subtotal": round(subtotal, 2),
            "gst_rate": 18,
            "gst_amount": gst_amount,
            "delivery_charge": delivery_charge,
            "total": total
        }

        shipping_address = {
            "full_name": profile.get("full_name") or "User",
            "line1": address.get("line1", ""),
            "line2": address.get("line2"),
            "city": address.get("city", ""),
            "state": address.get("state", ""),
            "pincode": address.get("pincode", ""),
            "mobile": profile.get("mobile") or ""
        }

        order_data = {
            "user_id": ObjectId(user_id),
            "items": order_items,
            "shipping_address": shipping_address,
            "order_status": OrderStatus.pending.value,
            "summary": order_summary,
            "payment_status": PaymentStatus.paid.value if payment_method == PaymentMethod.online else PaymentStatus.pending.value,
            "payment_method": payment_method.value
        }

        # 5. Create Order FIRST
        order_id = await create_order_in_db(orders_collection(), order_data)

        # 6. Decrement Stock with rollback on failure
        decremented = []
        try:
            for item in items:
                success = await decrement_product_stock(products_collection(), item["product_id"], item["quantity"])
                if not success:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {item['name']}")
                decremented.append(item)
        except Exception as e:
            # Rollback: restore already-decremented stock
            for dec_item in decremented:
                await increment_product_stock(products_collection(), dec_item["product_id"], dec_item["quantity"])
            # Cancel the order we just created
            await update_order_status_db(orders_collection(), order_id, user_id, OrderStatus.cancelled.value)
            logger.error(f"Stock decrement failed during order {order_id}, rolled back: {e}")
            raise HTTPException(status_code=400, detail="Order failed due to stock issue. Please try again.")

        # 7. Clear Cart
        await clear_user_cart(cart_collection(), user_id)

        return {"message": "Order placed successfully", "order_id": order_id}

    @staticmethod
    async def buy_now(user_id: str, product_id: str, quantity: int, address_id: str, payment_method: PaymentMethod):
        """Place an order for a single product directly from the product page (Buy Now).
        Bypasses the cart entirely — cart is NOT modified."""
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")

        # 1. Profile completeness gate
        profile = await OrderService._check_profile_complete(user_id)

        # 2. Validate product
        product = await fetch_product_by_id(products_collection(), product_id)
        if not product or not product.get("is_active") or not product.get("is_approved"):
            raise HTTPException(status_code=400, detail="Product is not available")
        if product.get("stock", 0) < quantity:
            raise HTTPException(status_code=400, detail=f"Only {product.get('stock', 0)} units available")

        # 3. Resolve shipping address from profile
        if not profile.get("addresses"):
            raise HTTPException(status_code=400, detail="Add a delivery address before placing an order")
        address = next((a for a in profile["addresses"] if a["address_id"] == address_id), None)
        if not address:
            raise HTTPException(status_code=400, detail="Selected address not found")

        # 4. Build single-item order
        price = float(product.get("price", 0))
        item_total = round(price * quantity, 2)
        subtotal = item_total

        order_items = [{
            "product_id": ObjectId(product_id),
            "seller_id": ObjectId(product.get("seller_id")),
            "name": product.get("name", ""),
            "image": (product.get("image_urls") or [""])[0],
            "price": price,
            "quantity": quantity,
            "item_total": item_total,
            "item_status": ItemStatus.pending.value
        }]

        delivery_charge = 0.0 if subtotal >= 500.0 else 50.0
        gst_amount = round(subtotal * 0.18, 2)
        total = round(subtotal + delivery_charge + gst_amount, 2)

        order_summary = {
            "subtotal": round(subtotal, 2),
            "gst_rate": 18,
            "gst_amount": gst_amount,
            "delivery_charge": delivery_charge,
            "total": total
        }

        shipping_address = {
            "full_name": profile.get("full_name") or "User",
            "line1": address.get("line1", ""),
            "line2": address.get("line2"),
            "city": address.get("city", ""),
            "state": address.get("state", ""),
            "pincode": address.get("pincode", ""),
            "mobile": profile.get("mobile") or ""
        }

        order_data = {
            "user_id": ObjectId(user_id),
            "items": order_items,
            "shipping_address": shipping_address,
            "order_status": OrderStatus.pending.value,
            "summary": order_summary,
            "payment_status": PaymentStatus.paid.value if payment_method == PaymentMethod.online else PaymentStatus.pending.value,
            "payment_method": payment_method.value
        }

        # 5. Create order
        order_id = await create_order_in_db(orders_collection(), order_data)

        # 6. Decrement stock with rollback on failure
        try:
            success = await decrement_product_stock(products_collection(), product_id, quantity)
            if not success:
                # Stock was NOT deducted — cancel order but do NOT restore stock
                await update_order_status_db(orders_collection(), order_id, user_id, OrderStatus.cancelled.value)
                raise HTTPException(status_code=400, detail="Insufficient stock")
        except HTTPException:
            raise  # Re-raise HTTP exceptions as-is (stock was not deducted)
        except Exception as e:
            # Stock WAS deducted but something else failed — restore it
            await increment_product_stock(products_collection(), product_id, quantity)
            await update_order_status_db(orders_collection(), order_id, user_id, OrderStatus.cancelled.value)
            logger.error(f"Stock decrement failed for buy_now order {order_id}: {e}")
            raise HTTPException(status_code=400, detail="Order failed due to stock issue. Please try again.")

        # Cart is intentionally NOT cleared — this was a direct purchase
        return {"message": "Order placed successfully", "order_id": order_id}

    @staticmethod
    async def get_user_orders(
        user_id: str, 
        status: str = None, 
        page: int = 1, 
        limit: int = 10,
        year: Optional[int] = None,
        month: Optional[int] = None
    ):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        skip = (page - 1) * limit
        date_from = None
        date_to = None

        if year:
            from calendar import monthrange
            if month:
                date_from = datetime(year, month, 1)
                last_day = monthrange(year, month)[1]
                date_to = datetime(year, month, last_day, 23, 59, 59)
            else:
                date_from = datetime(year, 1, 1)
                date_to = datetime(year, 12, 31, 23, 59, 59)
        
        orders, total_count = await get_user_orders_from_db(
            orders_collection(), 
            user_id, 
            status, 
            skip, 
            limit, 
            date_from, 
            date_to
        )
        
        # Serialize ObjectIds for response
        for order in orders:
            order["_id"] = str(order["_id"])
            order["user_id"] = str(order["user_id"])
            for item in order.get("items", []):
                item["product_id"] = str(item["product_id"])
                item["seller_id"] = str(item["seller_id"])
            
            # Dynamically compute user payment_status
            if order.get("payment_method") == PaymentMethod.online.value:
                order["payment_status"] = PaymentStatus.paid.value
            elif order.get("payment_method") == PaymentMethod.cod.value:
                if order.get("order_status") == OrderStatus.delivered.value:
                    order["payment_status"] = PaymentStatus.paid.value
                else:
                    order["payment_status"] = PaymentStatus.pending.value
                
        return {
            "items": orders,
            "total": total_count,
            "page": page,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit
        }

    @staticmethod
    async def get_order_by_id(user_id: str, order_id: str):
        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid IDs")
            
        order = await get_order_by_id_db(orders_collection(), order_id, user_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        order["_id"] = str(order["_id"])
        order["user_id"] = str(order["user_id"])
        for item in order.get("items", []):
            item["product_id"] = str(item["product_id"])
            item["seller_id"] = str(item["seller_id"])
            
        # Dynamically compute user payment_status
        if order.get("payment_method") == PaymentMethod.online.value:
            order["payment_status"] = PaymentStatus.paid.value
        elif order.get("payment_method") == PaymentMethod.cod.value:
            if order.get("order_status") == OrderStatus.delivered.value:
                order["payment_status"] = PaymentStatus.paid.value
            else:
                order["payment_status"] = PaymentStatus.pending.value
            
        return order

    @staticmethod
    async def cancel_order(user_id: str, order_id: str, product_id: str = None):
        """
        Cancel order or a specific item — pending/confirmed items only
        Supports cancellation of individual items (with product_id) or the entire order (without product_id).
        """
        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid IDs")

        if product_id and not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
            
        order = await get_order_by_id_db(orders_collection(), order_id, user_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        items = order.get("items", [])
        items_to_cancel = []
        
        if product_id:
            # Cancel specific item
            target_item = next((item for item in items if str(item.get("product_id")) == product_id), None)
            if not target_item:
                raise HTTPException(status_code=404, detail="Item not found in this order")
            
            if target_item.get("item_status") in [ItemStatus.shipped, ItemStatus.delivered, ItemStatus.cancelled]:
                 raise HTTPException(
                     status_code=400, 
                     detail=f"This item cannot be cancelled because it is already {target_item.get('item_status')}"
                 )
            items_to_cancel.append(target_item)
        else:
            # Cancel all eligible items
            eligible_items = [
                item for item in items 
                if item.get("item_status") not in [ItemStatus.shipped, ItemStatus.delivered, ItemStatus.cancelled]
            ]
            if not eligible_items:
                raise HTTPException(
                    status_code=400, 
                    detail="No eligible items found to cancel. Shipped or delivered items cannot be cancelled."
                )
            items_to_cancel = eligible_items

        # 1. Update item statuses in database
        # We need to update specifically the items we found
        product_ids_to_cancel = [ObjectId(item["product_id"]) for item in items_to_cancel]
        
        result = await orders_collection().update_one(
            {"_id": ObjectId(order_id), "user_id": ObjectId(user_id)},
            {
                "$set": {
                    "items.$[elem].item_status": ItemStatus.cancelled.value,
                    "updated_at": utc_now()
                }
            },
            array_filters=[{"elem.product_id": {"$in": product_ids_to_cancel}}]
        )
        
        if result.modified_count == 0:
             raise HTTPException(status_code=500, detail="Failed to update item statuses")

        # 2. Restore stock and update local items list for recompute
        # Use string set for reliable comparison
        cancel_id_set = {str(pid) for pid in product_ids_to_cancel}
        for item in items:
            if str(item["product_id"]) in cancel_id_set:
                item["item_status"] = ItemStatus.cancelled.value
                await increment_product_stock(products_collection(), str(item["product_id"]), item["quantity"])
                logger.info(f"Stock restored for product {item['product_id']} due to cancellation")

        # 3. Recompute overall order status
        new_order_status = compute_order_status(items)
        await orders_collection().update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"order_status": new_order_status.value, "updated_at": utc_now()}}
        )
            
        return {
            "message": "Selected items cancelled successfully",
            "cancelled_count": len(items_to_cancel),
            "new_order_status": new_order_status
        }

