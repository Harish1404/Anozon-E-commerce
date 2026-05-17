from fastapi import HTTPException
from app.models.product_model import ProductCreate, ProductUpdate, ProductStockUpdate, ProductToggleRequest
from app.utils.discount import calculate_discount_price
from app.utils.serializer import serialize_mongo
from app.models.orders_model import OrderItemStatusUpdate, OrderStatus, ItemStatus
from app.models.seller_model import SellerProfileUpdate
from app.repo import seller_helpers
from app.repo.seller_helpers import (
    get_seller_order_by_id,
    get_full_order_by_id,
    update_seller_order_item_status_by_product,
    update_order_status as db_update_order_status,
)
from app.db.mongodb import products_collection, orders_collection, sellers_collection
from app.repo.product_helpers import increment_product_stock
from app.core.time_utils import utc_now
from datetime import datetime
from bson import ObjectId
from app.utils.order_utils import compute_order_status, generate_slug, VALID_TRANSITION
import logging


logger = logging.getLogger("uvicorn.error")

class SellerService:
    
    @staticmethod
    async def create_product(seller_id: str, product_data: ProductCreate):
        slug = generate_slug(product_data.name)
        existing_product = await seller_helpers.get_product_by_slug(products_collection(), seller_id, slug)

        data = product_data.model_dump()
        data["seller_id"] = seller_id
        data["slug"] = slug
        data["is_approved"] = False
        data["updated_at"] = utc_now()
        
        # Calculate final price
        actual_price = data.get("actual_price", 0)
        discount_percent = data.get("discount_percent", 0)
        data["price"] = calculate_discount_price(actual_price, discount_percent)

        if existing_product:
            if not existing_product.get("is_deleted", False):
                raise HTTPException(status_code=409, detail="A product with this name already exists. Please edit the existing listing.")
            else:
                # Restore soft-deleted product
                data["is_deleted"] = False
                data["is_active"] = True
                
                success = await seller_helpers.update_seller_product(products_collection(), str(existing_product["_id"]), seller_id, data)
                if not success:
                    raise HTTPException(status_code=500, detail="Failed to restore product")
                
                return {
                    "message": "Product restored and waiting for approval",
                    "product_id": str(existing_product["_id"])
                }

        # New product
        data["is_active"] = True
        data["is_deleted"] = False
        data["avg_rating"] = 0.0
        data["review_count"] = 0
        data["created_at"] = utc_now()
        data["updated_at"] = data["created_at"]

        result = await seller_helpers.insert_seller_product(products_collection(), data)
        result["_id"] = str(result["_id"])
        return {
            "message": "Product created successfully and waiting for approval",
            "product_id": str(result["_id"]),
            "product_data": result
        }

    @staticmethod
    async def get_products(seller_id: str, page: int = 1, limit: int = 10):
        skip = (page - 1) * limit
        items, total = await seller_helpers.get_seller_products(products_collection(), seller_id, skip=skip, limit=limit)
        for item in items:
            item["_id"] = str(item["_id"])
        return {"items": items, "total": total, "page": page, "limit": limit}
  
    @staticmethod
    async def get_product_by_id(seller_id: str, product_id: str):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        product = await seller_helpers.get_seller_product_by_id(products_collection(), product_id, seller_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        product["_id"] = str(product["_id"])
        return product

    @staticmethod
    async def update_product(seller_id: str, product_id: str, product_data: ProductUpdate):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
            
        existing_product = await seller_helpers.get_seller_product_by_id(products_collection(), product_id, seller_id)
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = product_data.model_dump(exclude_unset=True)
        
        if "name" in update_data:
            new_slug = generate_slug(update_data["name"])
            if new_slug != existing_product.get("slug"):
                duplicate_check = await seller_helpers.get_product_by_slug(products_collection(), seller_id, new_slug)
                if duplicate_check and not duplicate_check.get("is_deleted", False):
                    raise HTTPException(status_code=409, detail="A product with this name already exists.")
            update_data["slug"] = new_slug

        # Recalculate price if actual_price or discount_percent changes
        if "actual_price" in update_data or "discount_percent" in update_data:
            new_actual_price = update_data.get("actual_price", existing_product.get("actual_price"))
            new_discount_percent = update_data.get("discount_percent", existing_product.get("discount_percent", 0))
            update_data["price"] = calculate_discount_price(new_actual_price, new_discount_percent)

        for field in ["is_approved", "is_deleted", "seller_id", "avg_rating", "review_count", "product_likes", "created_at", "updated_at", "_id", "id"]:
            update_data.pop(field, None)
        
        # Ensure updated_at is always current
        update_data["updated_at"] = utc_now()
        
        success = await seller_helpers.update_seller_product(products_collection(), product_id, seller_id, update_data)
        if not success:
            raise HTTPException(status_code=404, detail="No changes made")
        return {"message": "Product updated successfully"}

    @staticmethod
    async def toggle_product(seller_id: str, product_id: str, toggle_data: ProductToggleRequest):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
            
        existing_product = await seller_helpers.get_seller_product_by_id(products_collection(), product_id, seller_id)
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        success = await seller_helpers.update_seller_product(products_collection(), product_id, seller_id, {"is_active": toggle_data.is_active})
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product active status toggled"}

    @staticmethod
    async def update_stock(seller_id: str, product_id: str, stock_data: ProductStockUpdate):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
            
        existing_product = await seller_helpers.get_seller_product_by_id(products_collection(), product_id, seller_id)
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        success = await seller_helpers.update_seller_product(products_collection(), product_id, seller_id, {"stock": stock_data.stock})
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product stock updated"}

    @staticmethod
    async def delete_product(seller_id: str, product_id: str):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
            
        existing_product = await seller_helpers.get_seller_product_by_id(products_collection(), product_id, seller_id)
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        success = await seller_helpers.soft_delete_seller_product(products_collection(), product_id, seller_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}

    @staticmethod
    async def get_orders(seller_id: str, page: int = 1, limit: int = 10, status: str = None, year: int = None, month: int = None):

        skip = (page - 1) * limit

        items, total = await seller_helpers.get_seller_orders(
            orders_collection(),
            seller_id,
            skip=skip,
            limit=limit,
            status=status,
            year=year,
            month=month
        )

        items = serialize_mongo(items)

        # Compute seller_total for each order in the list
        for order in items:
            order["seller_total"] = sum(
                item.get("price", 0) * item.get("quantity", 1)
                for item in order.get("items", [])
            )

        return {"items": items, "total": total, "page": page, "limit": limit}

    @staticmethod
    async def get_order_by_id(seller_id: str, order_id: str):

        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")

        order = await seller_helpers.get_seller_order_by_id(orders_collection(), order_id, seller_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order = serialize_mongo(order)
        
        if "shipping_address" in order and "mobile" in order["shipping_address"]:
            del order["shipping_address"]["mobile"]
            
        seller_total = sum(item.get("price", 0) * item.get("quantity", 1) for item in order.get("items", []))
        order["seller_total"] = seller_total
        
        return order

    @staticmethod
    async def update_order_status(seller_id: str, order_id: str, product_id: str, status_data: OrderItemStatusUpdate):

        # --- 1. Validate IDs ---
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")

        # --- 2. Verify the order exists and belongs to this seller ---
        seller_order = await get_seller_order_by_id(orders_collection(), order_id, seller_id)
        if not seller_order:
            raise HTTPException(status_code=404, detail="Order not found or access denied")

        # --- 3. Find the specific item for this seller + product ---
        target_item = next(
            (item for item in seller_order.get("items", [])
             if str(item.get("product_id")) == product_id),
            None
        )
        if not target_item:
            raise HTTPException(status_code=404, detail="Item not found in this order")

        # --- 4. Validate the status transition ---
        current_status_str = target_item.get("item_status", "pending")
        current_status = ItemStatus(current_status_str)
        new_status = status_data.item_status
        allowed_next = VALID_TRANSITION.get(current_status, [])
        if new_status not in allowed_next:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition item from '{current_status}' to '{new_status}'. "
                       f"Allowed transitions: {allowed_next or 'none'}"
            )

        # --- 5. Update the specific item's status ---
        success = await update_seller_order_item_status_by_product(
            orders_collection(), order_id, seller_id, product_id, new_status
        )
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update order item status")

        # --- 6. Restore stock if the item was cancelled ---
        if new_status == ItemStatus.cancelled:
            quantity = target_item.get("quantity", 1)
            await increment_product_stock(products_collection(), product_id, quantity)
            logger.info(f"Stock restored: product {product_id} +{quantity} (order item cancelled)")

        # --- 7. Recompute aggregate order_status from ALL items ---
        full_order = await get_full_order_by_id(orders_collection(), order_id)
        if full_order:
            new_order_status = compute_order_status(full_order.get("items", []))
            await db_update_order_status(orders_collection(), order_id, new_order_status.value if hasattr(new_order_status, "value") else new_order_status)

        return {
            "message": f"Item status updated to '{new_status}'",
            "order_id": order_id,
            "product_id": product_id,
            "item_status": new_status,
        }

    @staticmethod
    async def update_profile(seller_id: str, profile_data: SellerProfileUpdate):
        update_data = profile_data.model_dump(exclude_unset=True)
        if not update_data:
             return {"message": "No fields to update"}
             
        update_data["updated_at"] = utc_now()
        
        # Use user_id as that's what's passed from the token
        result = await sellers_collection().update_one(
            {"user_id": seller_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Seller profile not found")
        
        if result.modified_count == 0:
            return {"message": "No changes made to profile"}
            
        return {"message": "Profile updated successfully"}
        
    @staticmethod
    async def get_profile(seller_id: str):
        profile = await seller_helpers.get_seller_by_user_id(sellers_collection(), seller_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Seller profile not found")
            
        # Get fresh stats for the Store Overview
        stats = await SellerService.get_dashboard(seller_id)
        profile["total_products"] = stats["products"]["total"]
        profile["total_orders"] = stats["orders"]["total"]
        profile["rating"] = stats["store"]["avg_rating"]
        
        profile["_id"] = str(profile["_id"])
        return profile

    @staticmethod
    async def get_dashboard(seller_id: str):
        stats = await seller_helpers.get_seller_dashboard_stats(
            products_collection(), orders_collection(), sellers_collection(), seller_id
        )
        return stats



