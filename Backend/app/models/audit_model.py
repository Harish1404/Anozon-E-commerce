from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime
from app.core.time_utils import utc_now
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]


class AuditPerformedBy(BaseModel):
    user_id: str
    name: str
    email: str
    role: str


class AuditTarget(BaseModel):
    user_id: str
    name: str
    email: str
    role_before: str
    role_after: Optional[str] = None


class AuditLog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    performed_by: AuditPerformedBy
    target: AuditTarget
    action: str
    module: str
    description: str
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=utc_now)


class AuditLogResponse(AuditLog):
    class Config:
        populate_by_name = True
