import logging
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from bson import ObjectId

logger = logging.getLogger("uvicorn.error")

async def get_user_by_id(collection, user_id: str):
    try:
        return await collection.find_one({"_id": ObjectId(user_id)})
    except PyMongoError as e:
        logger.error(f"DB Error fetching user by ID {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_user_role(collection, user_id: str, new_role: str, is_banned: bool = None):
    try:
        update_doc = {"role": new_role}
        if is_banned is not None:
            update_doc["is_banned"] = is_banned
            
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_doc}
        )
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating user role {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")
