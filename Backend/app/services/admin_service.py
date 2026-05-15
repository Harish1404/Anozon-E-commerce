"""
Admin service layer.
Orchestrates business logic for admin operations: dashboard, user/seller/product/review management.
Delegates DB queries to repo layer, handles validation, and triggers audit logging.
"""

from fastapi import HTTPException, status
from pymongo.errors import PyMongoError
from datetime import datetime
from app.db.mongodb import (
    sellers_collection, get_users_collection, products_collection,
    orders_collection, reviews_collection, audit_logs_collection
)
from app.core.time_utils import utc_now
from app.models.seller_model import SellerApplicationRequest, SellerProfile, SellerResponse
from app.services.audit_service import log_action
from app.repo.role_helpers import get_user_by_id, update_user_role
from app.repo.admin_helpers import (
    get_seller_by_user_id,
    insert_seller,
    update_seller_by_user_id,
    update_seller_by_object_id,
    get_pending_sellers,
    get_pending_products,
    update_product_approval_status,
    get_dashboard_stats,
    get_all_users,
    get_user_detail,
    get_all_sellers,
    get_seller_detail,
    get_all_products,
    get_all_reviews,
    delete_review_by_id,
    unban_user_db,
    get_recent_pending_sellers,
    get_recent_pending_products,
    get_seller_performance,
    get_approved_sellers_list,
)
from app.repo.seller_redis_helpers import (
    is_seller_apply_blocked,
    increment_seller_apply_count,
    get_seller_apply_attempts_remaining
)
from app.models.product_model import ProductResponse
from typing import Optional
import logging

logger = logging.getLogger("uvicorn.error")


# ── Dashboard ─────────────────────────────────────────────────────────────────

async def get_admin_dashboard():
    """Fetch aggregated dashboard stats + recent pending items + recent audit logs."""
    stats = await get_dashboard_stats(
        get_users_collection(),
        sellers_collection(),
        products_collection(),
        orders_collection()
    )

    recent_sellers = await get_recent_pending_sellers(sellers_collection(), limit=5)
    recent_products = await get_recent_pending_products(products_collection(), limit=5)

    # Fetch recent audit logs for the activity feed
    from app.repo.audit_helpers import fetch_audit_logs
    audit_result = await fetch_audit_logs(audit_logs_collection(), skip=0, limit=10)
    recent_activity = audit_result.get("logs", []) if isinstance(audit_result, dict) else []
    for log in recent_activity:
        log["_id"] = str(log["_id"])

    # Fetch seller performance (top & worst)
    seller_perf = await get_seller_performance(products_collection(), sellers_collection())

    return {
        "metrics": stats,
        "pending_sellers": recent_sellers,
        "pending_products": recent_products,
        "recent_activity": recent_activity,
        "top_sellers": seller_perf.get("top_sellers", []),
        "worst_sellers": seller_perf.get("worst_sellers", []),
    }


# ── User Management ──────────────────────────────────────────────────────────

async def fetch_all_users(page: int = 1, limit: int = 20, search: Optional[str] = None,
                          role: Optional[str] = None, user_status: Optional[str] = None):
    skip = (page - 1) * limit
    result = await get_all_users(
        get_users_collection(), limit=limit, skip=skip,
        search=search, role=role, status=user_status
    )
    return {
        "users": result["users"],
        "total": result["total"],
        "page": page,
        "limit": limit,
    }


async def fetch_user_detail(user_id: str):
    user = await get_user_detail(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def unban_user(user_id: str, admin_id: str):
    user = await get_user_by_id(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.get("is_banned", False):
        raise HTTPException(status_code=400, detail="User is not banned")

    success = await unban_user_db(get_users_collection(), user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to unban user")

    await log_action(
        action="user_unbanned",
        target_user_id=user_id,
        performed_by=admin_id,
        from_role=user.get("role", "user"),
        to_role=user.get("role", "user")
    )
    return {"message": "User unbanned successfully"}


# ── Seller Management ────────────────────────────────────────────────────────

async def fetch_all_sellers(page: int = 1, limit: int = 20, search: Optional[str] = None,
                            seller_status: Optional[str] = None):
    skip = (page - 1) * limit
    result = await get_all_sellers(
        sellers_collection(), limit=limit, skip=skip,
        search=search, status=seller_status
    )
    return {
        "sellers": result["sellers"],
        "total": result["total"],
        "page": page,
        "limit": limit,
    }


async def fetch_seller_detail(user_id: str):
    seller = await get_seller_detail(sellers_collection(), user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller


# ── Product Management ───────────────────────────────────────────────────────

async def fetch_all_products(page: int = 1, limit: int = 20, search: Optional[str] = None,
                             category: Optional[str] = None, product_status: Optional[str] = None):
    skip = (page - 1) * limit
    result = await get_all_products(
        products_collection(), limit=limit, skip=skip,
        search=search, category=category, status=product_status
    )
    return {
        "products": result["products"],
        "total": result["total"],
        "page": page,
        "limit": limit,
    }


# ── Review Management ────────────────────────────────────────────────────────

async def fetch_all_reviews(page: int = 1, limit: int = 20, search: Optional[str] = None,
                            product_id: Optional[str] = None, seller_id: Optional[str] = None,
                            min_rating: Optional[float] = None,
                            max_rating: Optional[float] = None):
    skip = (page - 1) * limit
    result = await get_all_reviews(
        reviews_collection(),
        products_col=products_collection(),
        limit=limit, skip=skip,
        search=search, product_id=product_id, seller_id=seller_id,
        min_rating=min_rating, max_rating=max_rating
    )
    return {
        "reviews": result["reviews"],
        "total": result["total"],
        "page": page,
        "limit": limit,
    }


async def get_sellers_dropdown_list():
    """Lightweight list of approved sellers for filter dropdowns."""
    return await get_approved_sellers_list(sellers_collection())


async def admin_delete_review(review_id: str, admin_id: str, reason: str):
    success = await delete_review_by_id(reviews_collection(), products_collection(), review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")

    await log_action(
        action="review_deleted",
        target_user_id=review_id,
        performed_by=admin_id,
        from_role="admin",
        to_role="admin",
        reason=reason,
        module="review",
        description=f"Admin deleted review {review_id} — {reason}"
    )
    return {"message": "Review deleted successfully"}


# ── Seller Application Flow (existing — kept intact) ─────────────────────────

async def apply_for_seller(user_id: str, payload: SellerApplicationRequest):
    user = await get_user_by_id(get_users_collection(), user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="User must be verified to apply for seller")
        
    if user.get("is_banned", False):
        raise HTTPException(status_code=400, detail="Banned users cannot apply")

    # Check if rate limited
    if await is_seller_apply_blocked(user_id):
        raise HTTPException(status_code=429, detail="Too many applications. Try again after 30 days")

    # Check if application already exists
    existing = await get_seller_by_user_id(sellers_collection(), user_id)
    if existing:
        app_status = existing.get("application_status")

        if app_status == "pending":
            raise HTTPException(status_code=400, detail="Application already under review")
        if app_status == "approved":
            raise HTTPException(status_code=400, detail="You are already an approved seller")
        if existing.get("is_suspended"):
            raise HTTPException(status_code=400, detail="Account suspended, contact support")

        # Status is "rejected" — rate limit the reapplication
        count = await increment_seller_apply_count(user_id)
        if count >= 3:
            raise HTTPException(status_code=429, detail="Too many applications. Try again after 30 days")

        # Update existing doc back to pending
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
                "updated_at": utc_now()
            }
        )

        await log_action(
            action="seller_reapplied",
            target_user_id=user_id,
            performed_by=user_id,
            from_role=user.get("role", "user"),
            to_role=user.get("role", "user")
        )
        return {"message": "Application resubmitted successfully"}

    # Create new profile (first application — no rate limit count)
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

        await log_action(
            action="seller_application_submitted",
            target_user_id=user_id,
            performed_by=user_id,
            from_role=user.get("role", "user"),
            to_role=user.get("role", "user")
        )
        return {"message": "Seller application submitted successfully"}
    except PyMongoError as e:
        logger.error(f"Error submitting seller application for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit application")


async def get_seller_application_status(user_id: str):
    """Get the current seller application status for a user."""
    existing = await get_seller_by_user_id(sellers_collection(), user_id)
    if not existing:
        return {
            "application_status": None,
            "submitted_at": None,
            "reviewed_at": None,
            "rejection_reason": None,
            "reapply_attempts_remaining": 3
        }

    remaining = await get_seller_apply_attempts_remaining(user_id)
    return {
        "application_status": existing.get("application_status"),
        "submitted_at": existing.get("created_at"),
        "reviewed_at": existing.get("reviewed_at"),
        "rejection_reason": existing.get("rejection_reason"),
        "reapply_attempts_remaining": remaining
    }

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
                "reviewed_at": utc_now(),
                "updated_at": utc_now()
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
        await update_seller_by_user_id(
            sellers_collection(),
            target_user_id,
            {
                "application_status": "rejected",
                "rejection_reason": reason,
                "reviewed_by": admin_id,
                "reviewed_at": utc_now(),
                "updated_at": utc_now()
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
                "suspended_at": utc_now(),
                "suspended_by": admin_id,
                "updated_at": utc_now()
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
                "unsuspend_at": utc_now(),
                "unsuspend_by": admin_id,
                "updated_at": utc_now()
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
