from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated
from enum import Enum
from datetime import datetime
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class AuditAction(str, Enum):
    promoted_to_admin = "promoted_to_admin"
    promoted_to_seller = "promoted_to_seller"
    demoted = "demoted"
    seller_approved = "seller_approved"
    seller_rejected = "seller_rejected"
    seller_suspended = "seller_suspended"
    seller_unsuspended = "seller_unsuspended"
    user_banned = "user_banned"

class AuditLog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    action: AuditAction
    target_user_id: PyObjectId
    performed_by: PyObjectId
    from_role: str
    to_role: Optional[str] = None
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AuditLogResponse(AuditLog):
    class Config:
        populate_by_name = True
