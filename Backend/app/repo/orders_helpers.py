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

async def get_user_orders_from_db(orders_collection, user_id: str, status: Optional[str] = None) -> list:
    """Fetches orders for a specific user, optionally filtered by status."""
    try:
        query = {"user_id": ObjectId(user_id)}
        if status:
            query["order_status"] = status
            
        cursor = orders_collection.find(query).sort("created_at", -1)
        orders = await cursor.to_list(length=100)
        return orders
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

