from pydantic import BaseModel, Field, HttpUrl, BeforeValidator
from typing import Optional, Annotated

# 1. Helper to handle MongoDB ObjectId -> String conversion
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- BASE MODEL (Shared Rules) ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100) # Increased to 100
    category: str = Field(..., min_length=3, max_length=50) # Increased to 50
    description: str = Field(..., min_length=10, max_length=1000) # Increased to 1000
    price: int = Field(..., gt=0) # Changed to float for cents (e.g. 10.99)
    stock_quantity: int = Field(..., ge=0) # Cannot be negative
    image_url: HttpUrl # Validates it is a real URL
    liked_by: list[PyObjectId] = Field(default_factory=list) # List of User IDs who liked the product

# --- CREATE MODEL (Input) ---
class ProductCreate(ProductBase):
    pass # Inherits everything from Base

# --- UPDATE MODEL (For PUT/PATCH) ---
class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    category: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[HttpUrl] = None

# --- RESPONSE MODEL (Output to Frontend) ---
class ProductResponse(ProductBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    likes_count: int = 0 # Better to return a count
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Cloud Hoodie",
                "category": "Clothing",
                "description": "A warm hoodie for late night deployments.",
                "price": 49.99,
                "stock_quantity": 100,
                "image_url": "https://example.com/hoodie.jpg",
                "likes_count": 5
            }
        }