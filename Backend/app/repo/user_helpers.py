from bson import ObjectId
from pymongo.errors import PyMongoError
import logging

logger = logging.getLogger("uvicorn.error")

async def get_user_by_id(collection, user_id: str):
    try:
        return await collection.find_one({"_id": ObjectId(user_id)})
    except PyMongoError as e:
        logger.error(f"Error fetching user by ID {user_id}: {e}")
        raise e


