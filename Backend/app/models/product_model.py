from pydantic import BaseModel, Field, HttpUrl, BeforeValidator
from typing import Optional, Annotated

# 1. Helper to handle MongoDB ObjectId -> String conversion
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- BASE MODEL (Shared Rules) ---
class ProductBase(BaseModel):
    name: str = Field(...),
    slug: str = Field(...),
    description: str = Field(...),
    category: str = Field(...),
    price: int = Field(...),
    discount_percent: int = Field(...),
    discount_price: int = Field(...),
    stock: int = Field(...),
    image_urls: list[str] = Field(...),
    is_active: bool = Field(...),
    avg_rating: float = Field(...),
    review_count: int = Field(...),
    product_likes: int = Field(...),
    

# --- CREATE MODEL (Input) ---
class ProductCreate(ProductBase):
    pass # Inherits everything from Base

class ProductInDB(ProductBase):
    id: PyObjectId = Field(alias="_id")
    seller_id: ObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "arbitrary_types_allowed": True
    }

# --- UPDATE MODEL (For PUT/PATCH) ---
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[int] = None
    discount_percent: Optional[int] = None
    discount_price: Optional[int] = None
    stock: Optional[int] = None
    image_urls: Optional[list[str]] = None
    is_active: Optional[bool] = None
    avg_rating: Optional[float] = None
    review_count: Optional[int] = None
    product_likes: Optional[int] = None
    seller_id: Optional[ObjectId] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
# --- RESPONSE MODEL (Output to Frontend) ---
class ProductResponse(ProductBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    description: str = Field(...)
    category: str = Field(...)
    price: int = Field(...)
    discount_percent: int = Field(...)
    discount_price: int = Field(...)
    stock: int = Field(...)
    image_urls: list[str] = Field(...)
    is_active: bool = Field(...)
    avg_rating: float = Field(...)
    review_count: int = Field(...)
    product_likes: int = Field(...)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    seller_id: str = Field(...)

    model_config = {
        "from_attributes": True,   # maps ProductInDB -> ProductResponse
        "populate_by_name": True,
    }

class PaginatedProductResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int

