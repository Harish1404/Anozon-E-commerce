from fastapi import HTTPException, status
from pymongo.errors import PyMongoError
from app.db.mongodb import get_users_collection, sellers_collection
from app.services.audit_service import log_action
from app.repo.role_helpers import get_user_by_id, update_user_role
from app.repo.admin_helpers import update_seller_by_user_id
import logging

logger = logging.getLogger("uvicorn.error")

async def promote_to_admin(user_id: str, performed_by: str):
    user = await get_user_by_id(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="User must be verified to be promoted to admin")
        
    if user.get("is_banned", False) or user.get("is_suspended", False):
        raise HTTPException(status_code=400, detail="Cannot promote a banned or suspended user")

    old_role = user.get("role", "user")
    if old_role == "admin":
        raise HTTPException(status_code=400, detail="User is already an admin")

    logger.info(f"Promoting user {user_id} to admin by {performed_by}")
    try:
        await update_user_role(get_users_collection(), user_id, "admin")
        
        await log_action(
            action="promoted_to_admin",
            target_user_id=user_id,
            performed_by=performed_by,
            from_role=old_role,
            to_role="admin"
        )
        return {"message": "User promoted to admin successfully"}
    except PyMongoError as e:
        logger.error(f"Error promoting user {user_id} to admin: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

async def demote_user(user_id: str, performed_by: str):
    user = await get_user_by_id(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_role = user.get("role", "user")
    if old_role == "user":
        raise HTTPException(status_code=400, detail="User is already at the lowest role")
        
    if old_role == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot demote a super admin")

    logger.info(f"Demoting user {user_id} from {old_role} to user by {performed_by}")
    try:
        await update_user_role(get_users_collection(), user_id, "user")
        
        # If demoting a seller, we must also suspend their seller profile
        if old_role == "seller":
            await update_seller_by_user_id(sellers_collection(), str(user_id), {"is_suspended": True})

        await log_action(
            action="demoted",
            target_user_id=user_id,
            performed_by=performed_by,
            from_role=old_role,
            to_role="user"
        )
        return {"message": f"User demoted from {old_role} to user successfully"}
    except PyMongoError as e:
        logger.error(f"Error demoting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

async def ban_user(user_id: str, performed_by: str):
    user = await get_user_by_id(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_role = user.get("role", "user")
    if old_role == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot ban a super admin")

    if user.get("is_banned", False):
        raise HTTPException(status_code=400, detail="User is already banned")

    logger.info(f"Banning user {user_id} by {performed_by}")
    try:
        await update_user_role(get_users_collection(), user_id, "user", is_banned=True)
        
        # If they were a seller, suspend their profile too
        if old_role == "seller":
            await update_seller_by_user_id(sellers_collection(), str(user_id), {"is_suspended": True})

        await log_action(
            action="user_banned",
            target_user_id=user_id,
            performed_by=performed_by,
            from_role=old_role,
            to_role="user"
        )
        return {"message": "User banned successfully"}
    except PyMongoError as e:
        logger.error(f"Error banning user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")
