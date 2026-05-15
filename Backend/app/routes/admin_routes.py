"""
Admin API routes.
Exposes endpoints for admin dashboard, user/seller/product/review management.
All routes require admin or super_admin permissions via dependency injection.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import Optional
from app.deps.roles import require_permission
from app.services.admin_service import (
    get_admin_dashboard,
    get_pending_applications, approve_seller, reject_seller, suspend_seller, unsuspend_seller,
    fetch_pending_products, approve_product, reject_product,
    fetch_all_users, fetch_user_detail, unban_user,
    fetch_all_sellers, fetch_seller_detail,
    fetch_all_products,
    fetch_all_reviews, admin_delete_review,
    get_sellers_dropdown_list,
)
from app.services.role_service import ban_user
from app.models.seller_model import SellerRejectRequest, SuspendRequest, UnsuspendRequest
from app.models.product_model import ProductRejectRequest
from app.db.mongodb import get_users_collection

router = APIRouter(prefix="/admin", tags=["Admin Features"])


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard(
    current_user: dict = Depends(require_permission("seller:approve"))
):
    """Get aggregated dashboard stats, pending items, and recent activity."""
    return await get_admin_dashboard()


# ── User Management ──────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by email or username"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter: banned, verified, unverified"),
    current_user: dict = Depends(require_permission("user:ban"))
):
    """List all users with search, role filter, and status filter."""
    return await fetch_all_users(page=page, limit=limit, search=search, role=role, user_status=status)


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    current_user: dict = Depends(require_permission("user:ban"))
):
    """Get detailed information for a single user."""
    return await fetch_user_detail(user_id)


@router.post("/users/{target_user_id}/ban")
async def ban_a_user(
    target_user_id: str,
    current_user: dict = Depends(require_permission("user:ban"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    return await ban_user(target_user_id, str(admin_user["_id"]))


@router.post("/users/{target_user_id}/unban")
async def unban_a_user(
    target_user_id: str,
    current_user: dict = Depends(require_permission("user:ban"))
):
    """Unban a previously banned user."""
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return await unban_user(target_user_id, str(admin_user["_id"]))


# ── Seller Management ────────────────────────────────────────────────────────

@router.get("/sellers")
async def list_sellers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by business name or email"),
    status: Optional[str] = Query(None, description="Filter: pending, approved, rejected, suspended"),
    current_user: dict = Depends(require_permission("seller:approve"))
):
    """List all seller profiles with search and status filter."""
    return await fetch_all_sellers(page=page, limit=limit, search=search, seller_status=status)


@router.get("/sellers/pending")
async def fetch_pending_sellers(
    limit: int = 50, skip: int = 0,
    current_user: dict = Depends(require_permission("seller:approve"))
):
    return await get_pending_applications(limit, skip)


@router.get("/sellers/list")
async def list_sellers_dropdown(
    current_user: dict = Depends(require_permission("seller:approve"))
):
    """Lightweight list of approved sellers for filter dropdowns."""
    sellers = await get_sellers_dropdown_list()
    return {"sellers": sellers}


@router.get("/sellers/{user_id}")
async def get_seller(
    user_id: str,
    current_user: dict = Depends(require_permission("seller:approve"))
):
    """Get detailed information for a single seller."""
    return await fetch_seller_detail(user_id)


@router.post("/sellers/{target_user_id}/approve")
async def approve_seller_application(
    target_user_id: str,
    current_user: dict = Depends(require_permission("seller:approve"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return await approve_seller(target_user_id, str(admin_user["_id"]))

@router.post("/sellers/{target_user_id}/reject")
async def reject_seller_application(
    target_user_id: str,
    payload: SellerRejectRequest,
    current_user: dict = Depends(require_permission("seller:reject"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return await reject_seller(target_user_id, str(admin_user["_id"]), payload.rejection_reason)

@router.post("/sellers/{target_user_id}/suspend")
async def suspend_active_seller(
    target_user_id: str,
    payload: SuspendRequest,
    current_user: dict = Depends(require_permission("seller:suspend"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return await suspend_seller(target_user_id, str(admin_user["_id"]), payload.suspend_reason)

@router.post("/sellers/{target_user_id}/unsuspend")
async def unsuspend_active_seller(
    target_user_id: str,
    payload: UnsuspendRequest,
    current_user: dict = Depends(require_permission("seller:suspend"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return await unsuspend_seller(target_user_id, str(admin_user["_id"]), payload.unsuspend_reason)


# ── Product Management ───────────────────────────────────────────────────────

@router.get("/products")
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by product name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter: pending, approved"),
    current_user: dict = Depends(require_permission("product:approve"))
):
    """List all products with search, category, and approval status filter."""
    return await fetch_all_products(page=page, limit=limit, search=search,
                                    category=category, product_status=status)


@router.get("/products/pending")
async def fetch_unapproved_products(
    limit: int = 50, skip: int = 0,
    current_user: dict = Depends(require_permission("product:approve"))
):
    return await fetch_pending_products(limit, skip)


@router.post("/products/{product_id}/approve")
async def approve_seller_product(
    product_id: str,
    current_user: dict = Depends(require_permission("product:approve"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    return await approve_product(product_id, str(admin_user["_id"]))

@router.post("/products/{product_id}/reject")
async def reject_seller_product(
    product_id: str,
    payload: ProductRejectRequest,
    current_user: dict = Depends(require_permission("product:approve"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    return await reject_product(product_id, str(admin_user["_id"]), payload.rejection_reason)


# ── Review Management ────────────────────────────────────────────────────────

@router.get("/reviews")
async def list_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search reviews by comment text"),
    product_id: Optional[str] = Query(None, description="Filter by product ID"),
    seller_id: Optional[str] = Query(None, description="Filter by seller user ID"),
    min_rating: Optional[float] = Query(None, ge=1, le=5),
    max_rating: Optional[float] = Query(None, ge=1, le=5),
    current_user: dict = Depends(require_permission("product:approve"))
):
    """List all platform reviews with optional filters for moderation."""
    return await fetch_all_reviews(
        page=page, limit=limit, search=search,
        product_id=product_id, seller_id=seller_id,
        min_rating=min_rating, max_rating=max_rating
    )


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: str,
    reason: str = Body(..., embed=True, min_length=5),
    current_user: dict = Depends(require_permission("product:approve"))
):
    """Delete a review by ID with a mandatory reason (logged to audit)."""
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return await admin_delete_review(review_id, str(admin_user["_id"]), reason)