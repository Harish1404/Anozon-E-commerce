import logging
from fastapi import HTTPException
from app.repo import seller_helpers
from app.models.product_model import ProductCreate, ProductUpdate, ProductStockUpdate, ProductToggleRequest
from app.models.orders_model import OrderItemStatusUpdate
from app.models.seller_model import SellerProfileUpdate
from app.db.mongodb import products_collection, orders_collection, sellers_collection
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger("uvicorn.error")

class SellerService:
    @staticmethod
    async def create_product(seller_id: str, product_data: ProductCreate):
        data = product_data.model_dump()
        data["seller_id"] = seller_id
        data["is_approved"] = False
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        result = await seller_helpers.insert_seller_product(products_collection(), data)
        result["_id"] = str(result["_id"])
        return result

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
        update_data = product_data.model_dump(exclude_unset=True)
        for field in ["is_approved", "seller_id", "avg_rating", "review_count", "product_likes", "created_at", "_id", "id"]:
            update_data.pop(field, None)
        
        success = await seller_helpers.update_seller_product(products_collection(), product_id, seller_id, update_data)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found or no changes made")
        return {"message": "Product updated successfully"}

    @staticmethod
    async def toggle_product(seller_id: str, product_id: str, toggle_data: ProductToggleRequest):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        success = await seller_helpers.update_seller_product(products_collection(), product_id, seller_id, {"is_active": toggle_data.is_active})
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product active status toggled"}

    @staticmethod
    async def update_stock(seller_id: str, product_id: str, stock_data: ProductStockUpdate):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        success = await seller_helpers.update_seller_product(products_collection(), product_id, seller_id, {"stock": stock_data.stock})
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product stock updated"}

    @staticmethod
    async def delete_product(seller_id: str, product_id: str):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        success = await seller_helpers.soft_delete_seller_product(products_collection(), product_id, seller_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}

    @staticmethod
    async def get_orders(seller_id: str, page: int = 1, limit: int = 10):
        skip = (page - 1) * limit
        items, total = await seller_helpers.get_seller_orders(orders_collection(), seller_id, skip=skip, limit=limit)
        for item in items:
            item["_id"] = str(item["_id"])
            if "user_id" in item:
                item["user_id"] = str(item["user_id"])
        return {"items": items, "total": total, "page": page, "limit": limit}

    @staticmethod
    async def get_order_by_id(seller_id: str, order_id: str):
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")
        order = await seller_helpers.get_seller_order_by_id(orders_collection(), order_id, seller_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order["_id"] = str(order["_id"])
        if "user_id" in order:
            order["user_id"] = str(order["user_id"])
        
        if "shipping_address" in order and "mobile" in order["shipping_address"]:
            del order["shipping_address"]["mobile"]
            
        seller_total = sum(item.get("price", 0) * item.get("quantity", 1) for item in order.get("items", []))
        order["seller_total"] = seller_total
        
        return order

    @staticmethod
    async def update_order_status(seller_id: str, order_id: str, status_data: OrderItemStatusUpdate):
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")
        success = await seller_helpers.update_seller_order_item_status(orders_collection(), order_id, seller_id, status_data.status.value)
        if not success:
            raise HTTPException(status_code=404, detail="Order item not found")
        return {"message": f"Order item status updated to {status_data.status.value}"}

    @staticmethod
    async def update_profile(seller_id: str, profile_data: SellerProfileUpdate):
        update_data = profile_data.model_dump(exclude_unset=True)
        if not update_data:
             return {"message": "No fields to update"}
             
        update_data["updated_at"] = datetime.utcnow()
        result = await sellers_collection().update_one(
            {"_id": ObjectId(seller_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Seller profile not found")
        return {"message": "Profile updated successfully"}
        
    @staticmethod
    async def get_profile(seller_id: str):
        profile = await sellers_collection().find_one({"_id": ObjectId(seller_id)})
        if not profile:
            raise HTTPException(status_code=404, detail="Seller profile not found")
        profile["_id"] = str(profile["_id"])
        if "user_id" in profile:
             profile["user_id"] = str(profile["user_id"])
        return profile

    @staticmethod
    async def get_dashboard(seller_id: str):
        stats = await seller_helpers.get_seller_dashboard_stats(products_collection(), orders_collection(), seller_id)
        return stats

