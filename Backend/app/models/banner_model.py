"""
Banner models for hero carousel slides.
Admins create/manage banners via CRUD endpoints; the landing page shows active ones.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.core.time_utils import utc_now


class BannerCreate(BaseModel):
    """Payload for creating a new banner slide."""
    title: str
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None           # Click target e.g. "/products?category=Electronics"
    priority: int = 0                        # Higher = shown first
    is_active: bool = True


class BannerUpdate(BaseModel):
    """Payload for partial banner update."""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class BannerInDB(BannerCreate):
    """Banner document as stored in MongoDB."""
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
