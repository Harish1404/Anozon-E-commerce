from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=15)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserInDB(BaseModel):
    email: EmailStr
    hashed_password: str
    refresh_token_hashed: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
