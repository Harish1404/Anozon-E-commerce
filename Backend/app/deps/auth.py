from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import verify_token
from app.db.mongodb import get_users_collection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), users_col = Depends(get_users_collection)):

    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    email, role = payload.get("sub"), payload.get("role")
    if not email or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return {"email": email, "role": role}


ROLE_PERMISSIONS: dict[str, set[str]] = {
    "super_admin": {
        "admin:create", "admin:demote",
        "seller:approve", "seller:suspend",
        "user:ban", "user:view",
        "product:any", "order:any",
        "system:settings"
    },
    "admin": {
        "seller:approve", "seller:suspend",
        "user:ban", "user:view",
        "product:any", "order:any"
    },
    "seller": {
        "product:own:write", "product:own:delete",
        "order:own:view"
    },
    "user": {
        "product:read",
        "cart:write",
        "order:own:create", "order:own:view",
        "profile:own:write"
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

