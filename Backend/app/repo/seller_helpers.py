import logging
from bson import ObjectId
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from datetime import datetime

logger = logging.getLogger("uvicorn.error")

async def insert_seller_product(collection, product_data: dict) -> dict:
    try:
        result = await collection.insert_one(product_data)
        product_data["_id"] = result.inserted_id
        return product_data
    except PyMongoError as e:
        logger.error(f"DB Error inserting product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_products(collection, seller_id: str, filters: dict = None, skip: int = 0, limit: int = 10):
    try:
        query = {"seller_id": seller_id, "is_deleted": False}
        if filters:
            query.update(filters)
        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)
        return items, total
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller products: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_product_by_id(collection, product_id: str, seller_id: str):
    try:
        product = await collection.find_one({"_id": ObjectId(product_id), "seller_id": seller_id, "is_deleted": False})
        return product
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_product(collection, product_id: str, seller_id: str, update_data: dict):
    try:
        update_data["updated_at"] = datetime.utcnow()
        result = await collection.update_one(
            {"_id": ObjectId(product_id), "seller_id": seller_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def soft_delete_seller_product(collection, product_id: str, seller_id: str):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(product_id), "seller_id": seller_id},
            {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error deleting seller product: {e}")
        logger.error(f"DB Error deleting seller product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_product_by_slug(collection, seller_id: str, slug: str):
    try:
        return await collection.find_one({"seller_id": seller_id, "slug": slug})
    except PyMongoError as e:
        logger.error(f"DB Error fetching product by slug: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_orders(collection, seller_id: str, skip: int = 0, limit: int = 10):
    try:
        pipeline = [
            {"$match": {"items.seller_id": seller_id}},
            {"$addFields": {
                "items": {
                    "$filter": {
                        "input": "$items",
                        "as": "item",
                        "cond": {"$eq": ["$$item.seller_id", seller_id]}
                    }
                }
            }},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        count_pipeline = [
            {"$match": {"items.seller_id": seller_id}},
            {"$count": "total"}
        ]
        
        cursor = collection.aggregate(pipeline)
        items = await cursor.to_list(length=limit)
        
        count_cursor = collection.aggregate(count_pipeline)
        count_result = await count_cursor.to_list(length=1)
        total = count_result[0]["total"] if count_result else 0
        
        return items, total
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller orders: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_order_by_id(collection, order_id: str, seller_id: str):
    try:
        pipeline = [
            {"$match": {"_id": ObjectId(order_id), "items.seller_id": seller_id}},
            {"$addFields": {
                "items": {
                    "$filter": {
                        "input": "$items",
                        "as": "item",
                        "cond": {"$eq": ["$$item.seller_id", seller_id]}
                    }
                }
            }}
        ]
        cursor = collection.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        return result[0] if result else None
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller order by id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_order_item_status(collection, order_id: str, seller_id: str, new_status: str):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "items.$[elem].status": new_status,
                    "updated_at": datetime.utcnow()
                }
            },
            array_filters=[{"elem.seller_id": seller_id}]
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller order status: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_dashboard_stats(product_collection, order_collection, seller_id: str):
    try:
        products = await product_collection.find({"seller_id": seller_id}).to_list(length=None)
        active_products = sum(1 for p in products if p.get("is_active") and p.get("is_approved"))
        pending_products = sum(1 for p in products if not p.get("is_approved"))
        low_stock = sum(1 for p in products if p.get("stock", 0) < 10)
        
        pipeline = [
            {"$match": {"items.seller_id": seller_id}},
            {"$unwind": "$items"},
            {"$match": {"items.seller_id": seller_id}}
        ]
        orders = await order_collection.aggregate(pipeline).to_list(length=None)
        
        total_revenue = 0
        this_month_revenue = 0
        
        now = datetime.utcnow()
        start_of_month = datetime(now.year, now.month, 1)
        
        for o in orders:
            item = o["items"]
            price = item.get("price", 0)
            quantity = item.get("quantity", 1)
            revenue = price * quantity
            total_revenue += revenue
            
            created_at = o.get("created_at")
            if created_at and created_at >= start_of_month:
                this_month_revenue += revenue
        
        return {
            "products": {
                "active": active_products,
                "pending": pending_products,
                "low_stock": low_stock
            },
            "orders": {
                "total": len(orders),
            },
            "revenue": {
                "total": total_revenue,
                "this_month": this_month_revenue
            }
        }
    except PyMongoError as e:
        logger.error(f"DB Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Database error")

# --- Restored Admin/Profile Helpers ---

async def get_seller_by_user_id(collection, user_id: str):
    try:
        return await collection.find_one({"user_id": user_id})
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller by user id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def insert_seller(collection, data: dict):
    try:
        result = await collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data
    except PyMongoError as e:
        logger.error(f"DB Error inserting seller: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_user_id(collection, user_id: str, data: dict):
    try:
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller by user id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_object_id(collection, obj_id, data: dict):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(obj_id)},
            {"$set": data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller by obj id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_pending_sellers(collection, limit: int, skip: int):
    try:
        cursor = collection.find({"application_status": "pending"}).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        for item in items:
            item["_id"] = str(item["_id"])
        return items
    except PyMongoError as e:
        logger.error(f"DB Error fetching pending sellers: {e}")
        raise HTTPException(status_code=500, detail="Database error")
