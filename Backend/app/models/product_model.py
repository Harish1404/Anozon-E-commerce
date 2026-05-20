from pydantic import BaseModel, Field, HttpUrl, BeforeValidator, model_validator
from typing import Optional, Annotated, Any
from bson import ObjectId
from datetime import datetime
from app.utils.discount import calculate_discount_price
from app.models.reviews_model import ReviewPublicResponse
from app.models.seller_model import SellerMinimalResponse
from app.core.time_utils import utc_now

# 1. Helper to handle MongoDB ObjectId -> String conversion
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- BASE MODEL (Shared Fields) ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(...)
    category: str = Field(...)
    actual_price: int = Field(..., gt=0) # User enters this
    stock: int = Field(..., ge=0)
    image_urls: Optional[list[str]] = Field(default_factory=list)
    brand: str = Field(default="Generic")
    sub_category: Optional[str] = Field(default="General")
    tags: Optional[list[str]] = Field(default_factory=list)
    specifications: Optional[dict[str, Any]] = Field(default_factory=dict)
    weight: Optional[float] = Field(default=0.0)
    dimensions: Optional[dict[str, float]] = Field(default_factory=lambda: {"length": 0.0, "width": 0.0, "height": 0.0})
    sku: Optional[str] = Field(default=None)
    variants: Optional[list[str]] = Field(default_factory=list)
    meta_title: Optional[str] = Field(default=None)
    meta_desc: Optional[str] = Field(default=None)
    is_featured: Optional[bool] = Field(default=False)
    view_count: Optional[int] = Field(default=0)
    search_keywords: Optional[list[str]] = Field(default_factory=list)

# --- CREATE MODEL (Input) ---
class ProductCreate(ProductBase):
    discount_percent: Optional[int] = Field(default=0, ge=0, le=100) # User enters this
    product_likes: Optional[int] = Field(default=0) # User enters this

# --- UPDATE MODEL (For PUT/PATCH) ---
class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    category: Optional[str] = None
    actual_price: Optional[int] = Field(default=None, gt=0)
    discount_percent: Optional[int] = Field(default=None, ge=0, le=100)
    stock: Optional[int] = Field(default=None, ge=0)
    image_urls: Optional[list[str]] = None
    brand: Optional[str] = None
    sub_category: Optional[str] = None
    tags: Optional[list[str]] = None
    specifications: Optional[dict[str, Any]] = None
    weight: Optional[float] = None
    dimensions: Optional[dict[str, float]] = None
    sku: Optional[str] = None
    variants: Optional[list[str]] = None
    meta_title: Optional[str] = None
    meta_desc: Optional[str] = None
    is_featured: Optional[bool] = None
    view_count: Optional[int] = None
    search_keywords: Optional[list[str]] = None
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

# --- IN DB MODEL ---
class ProductInDB(ProductBase):
    id: PyObjectId = Field(alias="_id")
    seller_id: PyObjectId
    slug: str
    discount_percent: int
    price: int # Final discounted price
    is_active: bool = Field(default=True)
    is_approved: bool = Field(default=False)
    is_deleted: bool = Field(default=False)
    avg_rating: float = Field(default=0.0)
    review_count: int = Field(default=0)
    product_likes: int = Field(default=0)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now) 

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
    
# --- RESPONSE MODEL (Output to Frontend) ---
class ProductResponse(ProductBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    seller_id: PyObjectId
    slug: str
    discount_percent: int
    price: int # Final discounted price
    is_active: bool
    is_approved: bool
    is_deleted: bool
    avg_rating: float
    review_count: int
    product_likes: int
    recent_reviews: list["ReviewPublicResponse"] = []
    seller_details: Optional["SellerMinimalResponse"] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,   # maps ProductInDB -> ProductResponse
        "populate_by_name": True,
    }


class ProductStockUpdate(BaseModel):
    stock: int = Field(..., ge=0)

class ProductToggleRequest(BaseModel):
    is_active: bool = Field(...)

class PaginatedProductResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int

class ProductRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=5)
