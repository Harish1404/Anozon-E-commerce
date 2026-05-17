"""
Super Admin API routes.
Endpoints for admin management (promote/demote), admin listing, and audit logs.
All routes require super_admin-level permissions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from app.deps.roles import require_permission, get_current_user
from app.services.role_service import promote_to_admin, demote_user
from app.services.audit_service import get_all_logs
from app.repo.admin_helpers import get_all_admins
from app.db.mongodb import get_users_collection
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])


@router.get("/admins")
async def list_admins(
    current_user: dict = Depends(require_permission("admin:create"))
):
    """List all admin and super_admin users."""
    admins = await get_all_admins(get_users_collection())
    return {"admins": admins, "total": len(admins)}


@router.post("/promote-admin/{target_user_id}")
async def promote_user_to_admin(
    target_user_id: str,
    current_user: dict = Depends(require_permission("admin:create"))
):
    email = current_user.get("email")
    super_admin = await get_users_collection().find_one({"email": email})
    if not super_admin:
        raise HTTPException(status_code=404, detail="Super Admin not found")
        
    return await promote_to_admin(target_user_id, str(super_admin["_id"]))

@router.post("/demote/{target_user_id}")
async def demote_any_user(
    target_user_id: str,
    current_user: dict = Depends(require_permission("admin:demote"))
):
    email = current_user.get("email")
    super_admin = await get_users_collection().find_one({"email": email})
    if not super_admin:
        raise HTTPException(status_code=404, detail="Super Admin not found")
        
    return await demote_user(target_user_id, str(super_admin["_id"]))

@router.get("/audit-logs")
async def view_audit_logs(
    module: Optional[str] = Query(None, description="Filter by module: role_management, seller, user, product, review"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    performed_by: Optional[str] = Query(None, description="Filter by admin email"),
    target: Optional[str] = Query(None, description="Filter by target user email"),
    date_from: Optional[datetime] = Query(None, description="Start date filter (ISO format)"),
    date_to: Optional[datetime] = Query(None, description="End date filter (ISO format)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_permission("audit:view"))
):
    """View audit logs with comprehensive filtering."""
    skip = (page - 1) * limit
    return await get_all_logs(
        module=module,
        action=action,
        performed_by_email=performed_by,
        target_email=target,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
