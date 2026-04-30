
from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
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
        "updated_at": datetime.utcnow()
    }


def profile_from_db(doc: dict) -> dict:
    """Serialize ObjectId fields for API response."""
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    return doc

async def create_empty_profile(collection, user_id: str, email: str):
    """Inserts a new empty profile document for the user."""
    try:
        profile_data = profile_to_db(user_id, email)
        result = await collection.insert_one(profile_data)
        return result
    except PyMongoError as e:
        logger.error(f"Error creating profile for user {user_id}: {e}")
        raise e

