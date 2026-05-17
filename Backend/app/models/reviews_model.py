from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime
from app.core.time_utils import utc_now
from bson import ObjectId
from enum import Enum

PyObjectId = Annotated[str, BeforeValidator(str)]


class ReviewQuality(str, Enum):
    excellent = "Excellent"
    good = "Good"
    average = "Average"
    poor = "Poor"


class Review(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    product_id: PyObjectId
    user_id: PyObjectId
    quality: ReviewQuality
    rating: float = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=500)
    is_verified_purchase: bool
    reviewed_at: datetime = Field(default_factory=utc_now)


class ReviewCreate(BaseModel):
    order_id: str
    product_id: str
    quality: ReviewQuality
    rating: float = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=500)


class ReviewPublicResponse(BaseModel):
    reviewer_name: str
    quality: str
    rating: float
    comment: str
    is_verified_purchase: bool
    reviewed_at: datetime


class ReviewResponse(Review):
    class Config:
        populate_by_name = True
