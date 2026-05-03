from pydantic import BaseModel, EmailStr, Field, BeforeValidator, field_validator
from typing import Optional, Annotated
from enum import Enum
import re

# Helper for MongoDB ID
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserRole(str, Enum):
    user = "user"
    seller = "seller"
    admin = "admin"
    super_admin = "super_admin"

# 1. Base Model (Shared properties)
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=15)
    email: EmailStr

# 2. Public Signup (SAFE - No role field)
class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str):
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v
        
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str):
        if not re.search(r"^[a-zA-Z0-9_@]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

# 3. Internal Creation (Used by backend logic - Can set role)
class UserCreateInternal(UserRegister):
    role: UserRole = UserRole.user 



# 5. Database Model (What actually gets saved)
class UserInDB(UserBase):
    hashed_password: str
    role: UserRole = UserRole.user
    is_verified: bool = False
    is_banned: bool = False
    refresh_token_hashed: Optional[str] = None
    
    # Optional: Timestamps (Good for auditing)
    # created_at: datetime = Field(default_factory=datetime.utcnow)

# 6. Response Model (What we send back to frontend - NO PASSWORDS)
class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    role: UserRole

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "username": "cloud_guru",
                "email": "harish@example.com",
                "role": "admin"
            }
        }
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    role: UserRole = UserRole.user


class RefreshTokenRequest(BaseModel):
    refresh_token: str

class OTPVerifyRequest(BaseModel):
    otp_token: str
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str):
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

