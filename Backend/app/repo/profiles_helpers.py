from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from bson import ObjectId
from pymongo.errors import PyMongoError
from app.core.time_utils import utc_now
import logging

logger = logging.getLogger("uvicorn.error")

def profile_to_db(user_id: str, email: str) -> dict:
    """Empty profile document to insert on user verification."""
    return {
        "user_id": ObjectId(user_id),
        "email": email,
        "full_name": None,
        "mobile": None,
        "avatar_url": None,
        "addresses": [],
        "updated_at": utc_now()
    }


def profile_from_db(doc: dict) -> dict:
    """Serialize ObjectId fields for API response."""
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    return doc

async def create_empty_profile(collection, user_id: str, email: str):
    """Inserts a new empty profile document for the user."""
    try:
        await collection.insert_one(profile_to_db(user_id, email))
    except PyMongoError as e:
        logger.error(f"DB Error creating profile for {user_id}: {e}")
        # We don't raise error here, just log it. Auth should succeed anyway.

async def get_profile_by_user_id(collection, user_id: str) -> Optional[dict]:
    try:
        return await collection.find_one({"user_id": ObjectId(user_id)})
    except PyMongoError as e:
        logger.error(f"DB Error fetching profile {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_profile_db(collection, user_id: str, update_data: dict) -> bool:
    try:
        update_data["updated_at"] = utc_now()
        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating profile {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def add_address_to_profile(collection, user_id: str, address_data: dict) -> bool:
    try:
        # If this is default, we might need to unset others. Handled in service.
        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$push": {"addresses": address_data}, "$set": {"updated_at": utc_now()}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error adding address to {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_address_in_profile(collection, user_id: str, address_id: str, address_data: dict) -> bool:
    try:
        # Construct dynamic $set for specific address element
        set_data = {"updated_at": utc_now()}
        for k, v in address_data.items():
            set_data[f"addresses.$.{k}"] = v
            
        result = await collection.update_one(
            {"user_id": ObjectId(user_id), "addresses.address_id": address_id},
            {"$set": set_data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating address in {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def delete_address_from_profile(collection, user_id: str, address_id: str) -> bool:
    try:
        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$pull": {"addresses": {"address_id": address_id}}, "$set": {"updated_at": utc_now()}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error deleting address from {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")
