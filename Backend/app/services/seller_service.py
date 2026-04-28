from fastapi import HTTPException, status
from datetime import datetime
from app.db.mongodb import sellers_collection, get_users_collection
from app.models.seller_model import SellerApplicationRequest, SellerProfile, SellerResponse
from app.services.audit_service import log_action
from app.repo.seller_helpers import (
    get_seller_by_user_id,
    insert_seller,
    update_seller_by_user_id,
    update_seller_by_object_id,
    get_pending_sellers
)
from app.repo.role_helpers import get_user_by_id, update_user_role

async def apply_for_seller(user_id: str, payload: SellerApplicationRequest):
    user = await get_user_by_id(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="User must be verified to apply for seller")
        
    if user.get("is_banned", False):
        raise HTTPException(status_code=400, detail="Banned users cannot apply")
        
    # Check if application already exists
    existing = await get_seller_by_user_id(sellers_collection(), user_id)
    if existing:
        if existing.get("application_status") == "pending":
            raise HTTPException(status_code=400, detail="Application already pending")
        if existing.get("application_status") == "approved":
            raise HTTPException(status_code=400, detail="You are already an approved seller")
        # If rejected, they can re-apply. We'll update the existing document.
        await update_seller_by_object_id(
            sellers_collection(),
            existing["_id"],
            {
                "business_name": payload.business_name,
                "business_type": payload.business_type.value if hasattr(payload.business_type, "value") else payload.business_type,
                "gstin": payload.gstin,
                "business_address": payload.business_address.model_dump(),
                "application_status": "pending",
                "rejection_reason": None,
                "updated_at": datetime.utcnow()
            }
        )
        return {"message": "Application resubmitted successfully"}

    # Create new profile
    profile = SellerProfile(
        user_id=user_id,
        email=user.get("email"),
        business_name=payload.business_name,
        business_type=payload.business_type,
        gstin=payload.gstin,
        business_address=payload.business_address
    )
    
    await insert_seller(sellers_collection(), profile.model_dump(by_alias=True, exclude={"id"}))
    return {"message": "Seller application submitted successfully"}

async def get_pending_applications(limit: int = 50, skip: int = 0):
    apps = await get_pending_sellers(sellers_collection(), limit, skip)
    return [SellerResponse(**app) for app in apps]

async def approve_seller(target_user_id: str, admin_id: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "pending":
        raise HTTPException(status_code=400, detail="No pending application found for this user")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    # Update Seller Profile
    await update_seller_by_user_id(
        sellers_collection(),
        target_user_id,
        {
            "application_status": "approved",
            "reviewed_by": admin_id,
            "reviewed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    
    # Update User Role
    await update_user_role(get_users_collection(), target_user_id, "seller")
    
    await log_action(
        action="seller_approved",
        target_user_id=target_user_id,
        performed_by=admin_id,
        from_role=old_role,
        to_role="seller"
    )
    return {"message": "Seller application approved successfully"}

async def reject_seller(target_user_id: str, admin_id: str, reason: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "pending":
        raise HTTPException(status_code=400, detail="No pending application found for this user")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    # Update Seller Profile
    await update_seller_by_user_id(
        sellers_collection(),
        target_user_id,
        {
            "application_status": "rejected",
            "rejection_reason": reason,
            "reviewed_by": admin_id,
            "reviewed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    
    await log_action(
        action="seller_rejected",
        target_user_id=target_user_id,
        performed_by=admin_id,
        from_role=old_role,
        to_role=old_role,
        reason=reason
    )
    return {"message": "Seller application rejected"}

async def suspend_seller(target_user_id: str, admin_id: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "approved":
        raise HTTPException(status_code=400, detail="User is not an approved seller")
        
    if profile.get("is_suspended"):
        raise HTTPException(status_code=400, detail="Seller is already suspended")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    await update_seller_by_user_id(
        sellers_collection(),
        target_user_id,
        {
            "is_suspended": True,
            "updated_at": datetime.utcnow()
        }
    )
    
    await log_action(
        action="seller_suspended",
        target_user_id=target_user_id,
        performed_by=admin_id,
        from_role=old_role,
        to_role=old_role
    )
    return {"message": "Seller has been suspended"}

async def unsuspend_seller(target_user_id: str, admin_id: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "approved":
        raise HTTPException(status_code=400, detail="User is not an approved seller")
        
    if not profile.get("is_suspended"):
        raise HTTPException(status_code=400, detail="Seller is not suspended")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    await update_seller_by_user_id(
        sellers_collection(),
        target_user_id,
        {
            "is_suspended": False,
            "updated_at": datetime.utcnow()
        }
    )
    
    await log_action(
        action="seller_unsuspended",
        target_user_id=target_user_id,
        performed_by=admin_id,
        from_role=old_role,
        to_role=old_role
    )
    return {"message": "Seller has been unsuspended"}
