from pydantic import BaseModel, Field, BeforeValidator, EmailStr
from typing import Optional, Annotated
from enum import Enum
from datetime import datetime
from app.core.time_utils import utc_now
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class BusinessType(str, Enum):
    individual = "individual"
    company = "company"
    partnership = "partnership"

class ApplicationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class BusinessAddress(BaseModel):
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str

class SellerApplicationRequest(BaseModel):
    business_name: str
    business_type: BusinessType
    gstin: Optional[str] = None
    business_address: BusinessAddress

class SellerRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=5)

class SuspendRequest(BaseModel):
    suspend_reason: str = Field(..., min_length=5)

class UnsuspendRequest(BaseModel):
    unsuspend_reason: str = Field(..., min_length=5)

class SellerProfile(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    email: EmailStr
    business_name: str
    business_type: BusinessType
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: BusinessAddress
    
    application_status: ApplicationStatus = ApplicationStatus.pending
    rejection_reason: Optional[str] = None
    reviewed_by: Optional[PyObjectId] = None
    reviewed_at: Optional[datetime] = None
    
    total_products: int = 0
    total_orders: int = 0
    rating: float = 0.0

    is_suspended: bool = False
    suspend_reason: Optional[str] = None
    suspended_at: Optional[datetime] = None
    suspended_by: Optional[PyObjectId] = None

    unsuspend_reason: Optional[str] = None
    unsuspend_at: Optional[datetime] = None
    unsuspend_by: Optional[PyObjectId] = None

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class SellerResponse(SellerProfile):
    class Config:
        populate_by_name = True

class SellerProfileUpdate(BaseModel):
    business_type: Optional[BusinessType] = None
    gstin: Optional[str] = None
    business_address: Optional[BusinessAddress] = None
    business_name: Optional[str] = None


class SellerMinimalResponse(BaseModel):
    business_name: str
    business_type: str
    rating: float


