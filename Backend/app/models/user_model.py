from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional, Annotated

# Helper for MongoDB ID
PyObjectId = Annotated[str, BeforeValidator(str)]

# 1. Base Model (Shared properties)
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=15)
    email: EmailStr

# 2. Public Signup (SAFE - No role field)
class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

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