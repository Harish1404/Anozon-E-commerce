from app.db.mongodb import audit_logs_collection
from app.models.audit_model import AuditLog, AuditLogResponse
from app.repo.audit_helpers import insert_audit_log, fetch_audit_logs
from typing import List, Optional
from datetime import datetime

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
    
    await insert_audit_log(audit_logs_collection(), audit_log.model_dump(by_alias=True, exclude={"id"}))

async def get_all_logs(limit: int = 50, skip: int = 0) -> List[AuditLogResponse]:
    logs = await fetch_audit_logs(audit_logs_collection(), limit, skip)
    return [AuditLogResponse(**log) for log in logs]
