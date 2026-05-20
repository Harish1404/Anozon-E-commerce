"""
Landing page response models.
Lightweight models for product cards, category groups, and the composite landing page response.
"""

from pydantic import BaseModel, Field
from typing import Optional, Annotated
from bson import ObjectId

# Reuse the same PyObjectId pattern from product_model
PyObjectId = Annotated[str, lambda v: str(v)]


class ProductCard(BaseModel):
    """~60-70% smaller than ProductResponse. No reviews, no seller_details."""
    id: str = Field(alias="_id")
    name: str
    slug: str
    image_url: Optional[str] = None          # First image only (extracted from image_urls)
    price: int
    actual_price: int
    discount_percent: int
    avg_rating: float = 0.0
    review_count: int = 0
    brand: str = "Generic"
    category: str
    sub_category: Optional[str] = None
    is_featured: bool = False
    in_stock: bool = True                     # Computed from stock > 0

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }


class CategoryGroup(BaseModel):
    """Category with its subcategories, count, and dynamic banner image URL."""
    category: str
    sub_categories: list[str] = []
    product_count: int = 0
    image_url: Optional[str] = None


class LandingPageResponse(BaseModel):
    """Composite response for the landing page — returned by GET /landing."""
    banners: list[dict] = []
    categories: list[CategoryGroup] = []
    flash_deals: list[ProductCard] = []
    top_products: list[ProductCard] = []
    new_arrivals: list[ProductCard] = []
    featured: list[ProductCard] = []
