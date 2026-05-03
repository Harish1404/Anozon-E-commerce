from fastapi import HTTPException
from bson import ObjectId
import logging
import uuid
from app.repo.profiles_helpers import (
    get_profile_by_user_id,
    update_profile_db,
    add_address_to_profile,
    update_address_in_profile,
    delete_address_from_profile
)
from app.db.mongodb import profiles_collection

logger = logging.getLogger("uvicorn.error")
class ProfileService:

    @staticmethod
    async def get_profile(user_id: str):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        profile = await get_profile_by_user_id(profiles_collection(), user_id)
        if not profile:
            # Return an empty profile shape so frontend can render the completion form
            return {
                "user_id": user_id,
                "full_name": None,
                "mobile": None,
                "email": None,
                "avatar_url": None,
                "addresses": [],
                "is_complete": False
            }
            
        profile["_id"] = str(profile["_id"])
        profile["user_id"] = str(profile["user_id"])
        
        # Add computed is_complete flag for frontend convenience
        profile["is_complete"] = bool(
            profile.get("full_name") and
            profile.get("mobile") and
            profile.get("addresses")
        )
        return profile

    @staticmethod
    async def update_profile(user_id: str, update_data: dict):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        # Clean up None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        if not update_data:
            return {"message": "No data to update"}
            
        success = await update_profile_db(profiles_collection(), user_id, update_data)
        if not success:
            logger.error(f"Failed to update profile for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to update profile")
            
        return {"message": "Profile updated successfully"}

    @staticmethod
    async def add_address(user_id: str, address_data: dict):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        profile = await get_profile_by_user_id(profiles_collection(), user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        address_data["address_id"] = str(uuid.uuid4())
        
        # Handle is_default logic
        if address_data.get("is_default"):
            # If this is default, we must unset others
            # A simple way is to fetch existing, change them, and then add this one.
            # But we can also just do a single update to turn them all off, then push this.
            for addr in profile.get("addresses", []):
                if addr.get("is_default"):
                    await update_address_in_profile(profiles_collection(), user_id, addr["address_id"], {"is_default": False})
                    
        # If it's the first address, make it default automatically
        if not profile.get("addresses"):
            address_data["is_default"] = True
            
        success = await add_address_to_profile(profiles_collection(), user_id, address_data)
        if not success:
            logger.error(f"Failed to add address for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to add address")
            
        return {"message": "Address added successfully", "address_id": address_data["address_id"]}

    @staticmethod
    async def update_address(user_id: str, address_id: str, address_data: dict):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        profile = await get_profile_by_user_id(profiles_collection(), user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        existing_address = next((addr for addr in profile.get("addresses", []) if addr["address_id"] == address_id), None)
        if not existing_address:
            raise HTTPException(status_code=404, detail="Address not found")
            
        update_data = {k: v for k, v in address_data.items() if v is not None}
        if not update_data:
            return {"message": "No data to update"}
            
        if update_data.get("is_default") and not existing_address.get("is_default"):
            # Unset others
            for addr in profile.get("addresses", []):
                if addr.get("is_default") and addr["address_id"] != address_id:
                    await update_address_in_profile(profiles_collection(), user_id, addr["address_id"], {"is_default": False})
                    
        success = await update_address_in_profile(profiles_collection(), user_id, address_id, update_data)
        if not success:
            logger.error(f"Failed to update address {address_id} for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to update address")
            
        return {"message": "Address updated successfully"}

    @staticmethod
    async def delete_address(user_id: str, address_id: str):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        profile = await get_profile_by_user_id(profiles_collection(), user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        existing_address = next((addr for addr in profile.get("addresses", []) if addr["address_id"] == address_id), None)
        if not existing_address:
            raise HTTPException(status_code=404, detail="Address not found")
            
        success = await delete_address_from_profile(profiles_collection(), user_id, address_id)
        if not success:
            logger.error(f"Failed to delete address {address_id} for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to delete address")
            
        # If the deleted address was default, make the first available one default
        if existing_address.get("is_default"):
            remaining = [a for a in profile.get("addresses", []) if a["address_id"] != address_id]
            if remaining:
                await update_address_in_profile(profiles_collection(), user_id, remaining[0]["address_id"], {"is_default": True})
                
        return {"message": "Address deleted successfully"}
