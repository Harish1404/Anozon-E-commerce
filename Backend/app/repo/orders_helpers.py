from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
from app.core.time_utils import utc_now
import logging
from typing import Optional

logger = logging.getLogger("uvicorn.error")


async def create_order_in_db(orders_collection, order_data: dict) -> str:
    """Inserts a new order document."""
    try:
        order_data["created_at"] = utc_now()
        order_data["updated_at"] = utc_now()
        result = await orders_collection.insert_one(order_data)
        return str(result.inserted_id)
    except PyMongoError as e:
        logger.error(f"Error creating order: {e}")
        raise e

async def get_user_orders_from_db(
    orders_collection, 
    user_id: str, 
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
) -> tuple[list, int]:
    """Fetches orders for a specific user with pagination and optional filtering."""
    try:
        query = {"user_id": ObjectId(user_id)}
        if status:
            query["order_status"] = status
        
        if date_from or date_to:
            query["created_at"] = {}
            if date_from:
                query["created_at"]["$gte"] = date_from
            if date_to:
                query["created_at"]["$lte"] = date_to
            
        total_count = await orders_collection.count_documents(query)
        cursor = orders_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        orders = await cursor.to_list(length=limit)
        return orders, total_count
    except PyMongoError as e:
        logger.error(f"Error fetching orders for user {user_id}: {e}")
        raise e

async def get_order_by_id_db(orders_collection, order_id: str, user_id: str) -> Optional[dict]:
    """Fetches a specific order for a user."""
    try:
        return await orders_collection.find_one({"_id": ObjectId(order_id), "user_id": ObjectId(user_id)})
    except PyMongoError as e:
        logger.error(f"Error fetching order {order_id}: {e}")
        raise e

async def update_order_status_db(orders_collection, order_id: str, user_id: str, new_status: str) -> bool:
    """Updates the status of an order."""
    try:
        result = await orders_collection.update_one(
            {"_id": ObjectId(order_id), "user_id": ObjectId(user_id)},
            {"$set": {"order_status": new_status, "updated_at": utc_now()}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"Error updating order status for {order_id}: {e}")
        raise e

