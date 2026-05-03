from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated
from enum import Enum
from datetime import datetime
from app.core.time_utils import utc_now
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class AddressLabel(str, Enum):
    Home = "Home"
    Work = "Work"
    Other = "Other"

class Address(BaseModel):
    address_id: str
    label: AddressLabel
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: bool = False


class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    avatar_url: Optional[str] = None
    addresses: list[Address] = []
    updated_at: datetime = Field(default_factory=utc_now)


class ProfileResponse(UserProfile):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
# ── Request schemas ────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    avatar_url: Optional[str] = None


class AddAddressRequest(BaseModel):
    label: AddressLabel
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: bool = False


class UpdateAddressRequest(BaseModel):
    label: Optional[AddressLabel] = None
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None


