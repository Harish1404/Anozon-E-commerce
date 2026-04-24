from pydantic import BaseModel, EmailStr, Field, BeforeValidator, field_validator
from typing import Optional, Annotated
import re

# Helper for MongoDB ID
PyObjectId = Annotated[str, BeforeValidator(str)]

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
        if not re.search(r"^[a-zA-Z0-9_]*$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

# 3. Internal Creation (Used by backend logic - Can set role)
class UserCreateInternal(UserRegister):
    role: str = "user" 

# 4. Cart model 
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

# 5. Database Model (What actually gets saved)
class UserInDB(UserBase):
    hashed_password: str
    role: str = "user"  # Default to user if missing
    is_verified: bool = False
    refresh_token_hashed: Optional[str] = None
    favorites: list[PyObjectId] = Field(default_factory=list)
    cart: list[CartItem] = Field(default_factory=list)
    
    # Optional: Timestamps (Good for auditing)
    # created_at: datetime = Field(default_factory=datetime.utcnow)

# 6. Response Model (What we send back to frontend - NO PASSWORDS)
class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    role: str

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
    token_type: str = "bearer"
    role: str  # <--- NEW: Send role back so Frontend knows to show Admin Dashboard

class CartRequest(BaseModel):
    product_id: str
    quantity: int = 1

class FavoriteRequest(BaseModel):
    product_id: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class OTPVerifyRequest(BaseModel):
    otp_token: str
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

