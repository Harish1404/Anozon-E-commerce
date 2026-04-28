from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class Review(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    product_id: PyObjectId
    user_id: PyObjectId
    rating: int = Field(ge=1, le=5)
    comment: str
    is_verified_purchase: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewResponse(Review):
    class Config:
        populate_by_name = True
