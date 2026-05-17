from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import verify_token
import logging

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
logger = logging.getLogger("uvicorn.error")


async def get_current_user(token: str = Depends(oauth2_scheme)):

    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user_id, email, role = payload.get("_id"), payload.get("email"), payload.get("role")
    if not user_id or not email or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return {"_id": str(user_id), "email": email, "role": role}


ROLE_PERMISSIONS = {
    "super_admin": {
        "admin:create", "admin:demote",
        "seller:approve", "seller:reject", "seller:suspend",
        "user:ban", "user:view",
        "product:any", "product:approve",
        "order:any",
        "system:settings",
        "audit:view"
    },
    "admin": {
        "seller:approve", "seller:reject", "seller:suspend",
        "user:ban", "user:view",
        "product:any", "product:approve",
        "order:any",
        "audit:view"
    },
    "seller": {
        "product:own:write",
        "product:own:delete",
        "product:own:toggle",
        "order:own:view",
        "order:own:status:update",
        "seller_profile:own:write"
    },
    "user": {
        "product:read",
        "cart:write",
        "order:own:create",
        "order:own:view",
        "order:own:cancel",
        "review:own:write",
        "profile:own:write",
        "seller:apply"
    }
}  

def get_user_permissions(role: str) -> set[str]:
    return ROLE_PERMISSIONS.get(role, set())


# ── Step 3: two dependency factories ──────────────────────────────────────

def require_role(*allowed_roles: str):
    """
    Use when you want to restrict by role name directly.
    Example: Depends(require_role("super_admin"))
             Depends(require_role("admin", "super_admin"))
    """
    async def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )
        return current_user
    return checker

def require_permission(permission: str):
    """
    Use when you want to restrict by capability, not role name.
    Example: Depends(require_permission("product:any"))
             Depends(require_permission("seller:approve"))
    """
    async def checker(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role", "user")
        permissions = get_user_permissions(role)

        if permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )
        return current_user
    return checker



