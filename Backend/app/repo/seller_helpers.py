import logging
from pymongo.errors import PyMongoError
from fastapi import HTTPException

logger = logging.getLogger("uvicorn.error")

async def get_seller_by_user_id(collection, user_id: str):
    try:
        return await collection.find_one({"user_id": user_id})
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def insert_seller(collection, profile_data: dict):
    try:
        result = await collection.insert_one(profile_data)
        return result
    except PyMongoError as e:
        logger.error(f"DB Error inserting seller: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_user_id(collection, user_id: str, update_data: dict):
    try:
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating seller {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_object_id(collection, object_id, update_data: dict):
    try:
        result = await collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating seller by doc ID {object_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_pending_sellers(collection, limit: int = 50, skip: int = 0):
    try:
        cursor = collection.find({"application_status": "pending"}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching pending sellers: {e}")
        raise HTTPException(status_code=500, detail="Database error")
