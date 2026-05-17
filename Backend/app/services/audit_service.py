from app.db.mongodb import audit_logs_collection, get_users_collection
from pymongo.errors import PyMongoError
from app.models.audit_model import AuditLog, AuditLogResponse, AuditPerformedBy, AuditTarget
from app.repo.audit_helpers import insert_audit_log, fetch_audit_logs
from app.core.time_utils import utc_now
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger("uvicorn.error")


async def _resolve_user_context(user_id: str) -> dict:
    """Fetch user name and email for audit snapshot."""
    try:
        user = await get_users_collection().find_one({"_id": __import__("bson").ObjectId(user_id)})
        if user:
            return {
                "user_id": user_id,
                "name": user.get("username", "Unknown"),
                "email": user.get("email", "unknown@email.com"),
                "role": user.get("role", "user")
            }
    except Exception:
        pass
    return {"user_id": user_id, "name": "Unknown", "email": "unknown", "role": "unknown"}


async def log_action(
    action: str, 
    target_user_id: str, 
    performed_by: str, 
    from_role: str, 
    to_role: Optional[str] = None, 
    reason: Optional[str] = None,
    module: Optional[str] = None,
    description: Optional[str] = None
):
    """Write an audit log entry with rich context.
    
    Auto-resolves performer and target user context from the database.
    Auto-determines module and description if not provided.
    """
    # Resolve performer context
    performer_ctx = await _resolve_user_context(performed_by)

    # Resolve target context
    target_ctx = await _resolve_user_context(target_user_id)
    target_ctx["role_before"] = from_role
    target_ctx["role_after"] = to_role

    # Auto-determine module from action
    if not module:
        module = _infer_module(action)

    # Auto-generate human-readable description
    if not description:
        description = _generate_description(action, performer_ctx, target_ctx, reason)

    audit_log = AuditLog(
        performed_by=AuditPerformedBy(**performer_ctx),
        target=AuditTarget(**target_ctx),
        action=action,
        module=module,
        description=description,
        reason=reason,
        timestamp=utc_now()
    )
    
    logger.info(f"Audit: [{module}] {action} — {description}")
    await insert_audit_log(
        audit_logs_collection(), 
        audit_log.model_dump(by_alias=True, exclude={"id"})
    )


def _infer_module(action: str) -> str:
    """Infer the module from the action name."""
    if any(kw in action for kw in ["promoted", "demoted"]):
        return "role_management"
    if any(kw in action for kw in ["seller", "application", "reapplied"]):
        return "seller"
    if any(kw in action for kw in ["banned", "unbanned"]):
        return "user"
    if any(kw in action for kw in ["review"]):
        return "review"
    if any(kw in action for kw in ["product"]):
        return "product"
    return "system"


def _generate_description(action: str, performer: dict, target: dict, reason: Optional[str] = None) -> str:
    """Generate a human-readable description."""
    p_name = performer.get("name", "Unknown")
    t_name = target.get("name", "Unknown")
    t_email = target.get("email", "")

    descriptions = {
        "promoted_to_admin": f"Promoted {t_name} ({t_email}) from {target.get('role_before', 'user')} to admin",
        "promoted_to_seller": f"Promoted {t_name} ({t_email}) from {target.get('role_before', 'user')} to seller",
        "demoted": f"Demoted {t_name} ({t_email}) from {target.get('role_before', 'unknown')} to user",
        "seller_approved": f"Approved seller application from {t_name} ({t_email})",
        "seller_rejected": f"Rejected seller application from {t_name} ({t_email}) — {reason or 'no reason'}",
        "seller_suspended": f"Suspended seller {t_name} ({t_email}) — {reason or 'no reason'}",
        "seller_unsuspended": f"Unsuspended seller {t_name} ({t_email})",
        "seller_application_submitted": f"{t_name} ({t_email}) submitted seller application",
        "seller_reapplied": f"{t_name} ({t_email}) resubmitted seller application",
        "user_banned": f"Banned user {t_name} ({t_email})",
        "user_unbanned": f"Unbanned user {t_name} ({t_email})",
        "product_approved": f"Admin {p_name} approved product {target.get('user_id', '')}",
        "product_rejected": f"Admin {p_name} rejected product {target.get('user_id', '')} — {reason or 'no reason'}",
        "review_deleted": f"Admin {p_name} deleted review {target.get('user_id', '')} — {reason or 'no reason'}",
    }

    return descriptions.get(action, f"{p_name} performed {action} on {t_name}")


async def get_all_logs(
    module: Optional[str] = None,
    action: Optional[str] = None,
    performed_by_email: Optional[str] = None,
    target_email: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 20
):
    """Fetch audit logs with optional filters."""
    logger.info(f"Fetching audit logs (module={module}, action={action}, limit={limit})")
    try:
        result = await fetch_audit_logs(
            audit_logs_collection(),
            module=module,
            action=action,
            performed_by_email=performed_by_email,
            target_email=target_email,
            date_from=date_from,
            date_to=date_to,
            skip=skip,
            limit=limit
        )

        logs = result["logs"]
        total = result["total"]

        # Serialize ObjectIds
        formatted_logs = []
        for log in logs:
            log["_id"] = str(log["_id"])
            formatted_logs.append(log)

        return {
            "logs": formatted_logs,
            "total": total,
            "page": (skip // limit) + 1,
            "limit": limit
        }
    except PyMongoError as e:
        logger.error(f"Error fetching audit logs: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Database query failed")
