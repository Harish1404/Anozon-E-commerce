from fastapi import HTTPException, status
from pymongo.errors import PyMongoError
from datetime import datetime
from app.db.mongodb import sellers_collection, get_users_collection
from app.models.seller_model import SellerApplicationRequest, SellerProfile, SellerResponse
from app.services.audit_service import log_action
import logging
from app.repo.role_helpers import get_user_by_id, update_user_role
from app.repo.admin_helpers import (
    get_seller_by_user_id,
    insert_seller,
    update_seller_by_user_id,
    update_seller_by_object_id,
    get_pending_sellers,
    get_pending_products,
    update_product_approval_status
)
from app.db.mongodb import products_collection
from app.models.product_model import ProductResponse

logger = logging.getLogger("uvicorn.error")



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
    
    logger.info(f"User {user_id} applied for seller profile")
    try:
        await insert_seller(sellers_collection(), profile.model_dump(by_alias=True, exclude={"id"}))
        return {"message": "Seller application submitted successfully"}
    except PyMongoError as e:
        logger.error(f"Error submitting seller application for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit application")

async def get_pending_applications(limit: int = 50, skip: int = 0):
    apps = await get_pending_sellers(sellers_collection(), limit, skip)
    return [SellerResponse(**app) for app in apps]

async def approve_seller(target_user_id: str, admin_id: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "pending":
        raise HTTPException(status_code=400, detail="No pending application found for this user")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    logger.info(f"Seller application for {target_user_id} approved by {admin_id}")
    try:
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
    except PyMongoError as e:
        logger.error(f"Error approving seller application for {target_user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

async def reject_seller(target_user_id: str, admin_id: str, reason: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "pending":
        raise HTTPException(status_code=400, detail="No pending application found for this user")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    logger.info(f"Seller application for {target_user_id} rejected by {admin_id}. Reason: {reason}")
    try:
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
    except PyMongoError as e:
        logger.error(f"Error rejecting seller application for {target_user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

async def suspend_seller(target_user_id: str, admin_id: str, reason: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "approved":
        raise HTTPException(status_code=400, detail="User is not an approved seller")
        
    if profile.get("is_suspended"):
        raise HTTPException(status_code=400, detail="Seller is already suspended")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    try:
        await update_seller_by_user_id(
            sellers_collection(),
            target_user_id,
            {
                "is_suspended": True,
                "suspend_reason": reason,
                "suspended_at": datetime.utcnow(),
                "suspended_by": admin_id,
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
        logger.info(f"Seller {target_user_id} suspended by {admin_id}")

        return {"message": "Seller has been suspended"}
    except PyMongoError as e:
        logger.error(f"Error suspending seller {target_user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

async def unsuspend_seller(target_user_id: str, admin_id: str, reason: str):
    profile = await get_seller_by_user_id(sellers_collection(), target_user_id)
    if not profile or profile.get("application_status") != "approved":
        raise HTTPException(status_code=400, detail="User is not an approved seller")
        
    if not profile.get("is_suspended"):
        raise HTTPException(status_code=400, detail="Seller is not suspended")
        
    user = await get_user_by_id(get_users_collection(), target_user_id)
    old_role = user.get("role", "user") if user else "user"

    logger.info(f"Seller {target_user_id} unsuspended by {admin_id}")
    try:
        await update_seller_by_user_id(
            sellers_collection(),
            target_user_id,
            {
                "is_suspended": False,
                "unsuspend_reason": reason,
                "unsuspend_at": datetime.utcnow(),
                "unsuspend_by": admin_id,
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
    except PyMongoError as e:
        logger.error(f"Error unsuspending seller {target_user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

async def fetch_pending_products(limit: int = 50, skip: int = 0):
    products = await get_pending_products(products_collection(), limit, skip)
    return [ProductResponse(**p, id=str(p["_id"])) for p in products]

async def approve_product(product_id: str, admin_id: str):
    success = await update_product_approval_status(products_collection(), product_id, True, admin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found or already approved")
    
    await log_action(
        action="product_approved",
        target_user_id=product_id,
        performed_by=admin_id,
        from_role="admin",
        to_role="seller"
    )
    return {"message": "Product approved successfully"}

async def reject_product(product_id: str, admin_id: str, reason: str):
    success = await update_product_approval_status(products_collection(), product_id, False, admin_id, reason)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await log_action(
        action="product_rejected",
        target_user_id=product_id,
        performed_by=admin_id,
        from_role="admin",
        reason=reason
    )
    return {"message": "Product rejected"}


