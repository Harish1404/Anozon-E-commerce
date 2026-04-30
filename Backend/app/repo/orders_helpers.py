from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
import logging

logger = logging.getLogger("uvicorn.error")

def orders_placeholder_to_db(user_id: str) -> dict:
    """Structure for an initial entry in orders (placeholder or summary)."""
    return {
        "user_id": ObjectId(user_id),
        "order_history": [],
        "total_orders": 0,
        "updated_at": datetime.utcnow()
    }

async def init_user_orders(collection, user_id: str):
    """Initializes an orders document for the user."""
    try:
        order_data = orders_placeholder_to_db(user_id)
        result = await collection.insert_one(order_data)
        return result
    except PyMongoError as e:
        logger.error(f"Error initializing orders for user {user_id}: {e}")
        raise e
