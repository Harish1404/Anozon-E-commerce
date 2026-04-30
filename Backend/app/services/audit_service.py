from app.db.mongodb import audit_logs_collection
from pymongo.errors import PyMongoError
from app.models.audit_model import AuditLog, AuditLogResponse
from app.repo.audit_helpers import insert_audit_log, fetch_audit_logs
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger("uvicorn.error")

async def log_action(
    action: str, 
    target_user_id: str, 
    performed_by: str, 
    from_role: str, 
    to_role: Optional[str] = None, 
    reason: Optional[str] = None
):
    audit_log = AuditLog(
        action=action,
        target_user_id=target_user_id,
        performed_by=performed_by,
        from_role=from_role,
        to_role=to_role,
        reason=reason,
        timestamp=datetime.utcnow()
    )
    
    logger.info(f"Logging audit action: {action} on target {target_user_id} by {performed_by}")
    try:
        await insert_audit_log(audit_logs_collection(), audit_log.model_dump(by_alias=True, exclude={"id"}))
    except PyMongoError as e:
        logger.error(f"Failed to insert audit log for action {action}: {e}")
        # We don't necessarily want to raise an exception here if auditing fails, 
        # but the user requested error logging.

async def get_all_logs(limit: int = 50, skip: int = 0) -> List[AuditLogResponse]:
    logger.info(f"Fetching audit logs (limit={limit}, skip={skip})")
    try:
        logs = await fetch_audit_logs(audit_logs_collection(), limit, skip)
        return [AuditLogResponse(**log) for log in logs]
    except PyMongoError as e:
        logger.error(f"Error fetching audit logs: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Database query failed")
