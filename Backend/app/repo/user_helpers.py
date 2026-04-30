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

async def update_user_favorites(collection, user_id: str, product_id: str, action: str):
    """
    action: 'add' or 'remove'
    """
    try:
        if action == 'add':
            result = await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"favorites": product_id}}
            )
        else:
            result = await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"favorites": product_id}}
            )
        return result
    except PyMongoError as e:
        logger.error(f"Error updating favorites for user {user_id}: {e}")
        raise e
