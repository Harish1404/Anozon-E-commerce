from fastapi import APIRouter, Depends, HTTPException
from app.deps.roles import require_permission, get_current_user
from app.services.role_service import promote_to_admin, demote_user
from app.services.audit_service import get_all_logs
from app.db.mongodb import get_users_collection

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

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
    limit: int = 50, skip: int = 0,
    current_user: dict = Depends(require_permission("audit:view"))
):
    return await get_all_logs(limit, skip)

