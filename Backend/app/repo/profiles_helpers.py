
from datetime import datetime
from bson import ObjectId

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

