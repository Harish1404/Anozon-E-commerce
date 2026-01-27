from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=15)
    category: str = Field(..., min_length=3, max_length=15)
    description: str = Field(..., min_length=5, max_length=50)
    price: int
    url: str
    likes: Optional[str]
    stock_quantity: int

class ResponseProduct(BaseModel):
    id: Optional[str]
    name: Optional[str]
    price: Optional[int]
    message: Optional[str]

class UpdateProduct(BaseModel):
    name: str = Field(..., min_length=3, max_length=15)
    category: str = Field(..., min_length=3, max_length=15)
    price: int
    stock_quantity: int

class PartialUpdate(BaseModel):
    name: Optional[str] 
    category: Optional[str]
    price: Optional[int]
    stock_quantity: Optional[int]
    updated_at: Optional[str]

