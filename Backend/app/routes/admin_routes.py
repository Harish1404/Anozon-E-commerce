from app.deps.roles import require_permission
from fastapi import APIRouter, Depends, HTTPException
from app.services.admin_service import (
    get_pending_applications, approve_seller, reject_seller, suspend_seller, unsuspend_seller,
    fetch_pending_products, approve_product, reject_product
)
from app.services.role_service import ban_user
from app.models.seller_model import SellerRejectRequest, SuspendRequest, UnsuspendRequest
from app.models.product_model import ProductRejectRequest
from app.db.mongodb import get_users_collection

router = APIRouter(prefix="/admin", tags=["Admin Features"])

@router.get("/sellers/pending")
async def fetch_pending_sellers(
    limit: int = 50, skip: int = 0,
    current_user: dict = Depends(require_permission("seller:approve"))
):
    return await get_pending_applications(limit, skip)

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

@router.post("/users/{target_user_id}/ban")
async def ban_a_user(
    target_user_id: str,
    current_user: dict = Depends(require_permission("user:ban"))
):
    email = current_user.get("email")
    admin_user = await get_users_collection().find_one({"email": email})
    return await ban_user(target_user_id, str(admin_user["_id"]))

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