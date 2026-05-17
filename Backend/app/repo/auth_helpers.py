from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
from app.core.security import create_access_token, create_refresh_token
from app.core.time_utils import utc_now
from fastapi import HTTPException
import logging

logger = logging.getLogger("uvicorn.error")


# Helper functions
async def get_user_by_email(collection, email: str):
    try:
        return await collection.find_one({"email": email})
    except PyMongoError as e:
        logger.error(f"DB Error fetching user {email}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def generate_tokens(id: str, email: str, role: str, user_col):
    try: 
        access_token = create_access_token({"_id": str(id), "email": email, "role": role, "iss": "Anozon", "aud": "Anozon", "iat": utc_now() })
        refresh_token = create_refresh_token({"_id": str(id), "email": email, "role": role, "iss": "Anozon", "aud": "Anozon", "iat": utc_now()})
        
        return access_token, refresh_token

    except Exception as e:
        logger.error(f"Token generation error: {e}")
        raise HTTPException(status_code=500, detail="Token generation failed")

async def count_users(collection):
    try: 
        count = await collection.count_documents({})
        return count
    except PyMongoError as e:
        logger.error(f"DB Error counting users: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def insert_user(collection, user_data: dict):
    try: 
        result = await collection.insert_one(user_data)
        return result
    except PyMongoError as e:
        logger.error(f"DB Error inserting user: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_user(collection, user_id: str, update_data: dict):
    try: 
        result = await collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating user: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def delete_user(collection, user_id: str):
    try: 
        result = await collection.delete_one({"_id": ObjectId(user_id)})
        return result
    except PyMongoError as e:
        logger.error(f"DB Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_user_by_email(collection, email: str, update_data: dict):
    try: 
        result = await collection.update_one({"email": email}, {"$set": update_data})
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating user by email: {e}")
        raise HTTPException(status_code=500, detail="Database error")
