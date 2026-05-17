from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime
from app.core.time_utils import utc_now
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class CartItem(BaseModel):
    product_id: PyObjectId
    quantity: int

class WishlistItem(BaseModel):
    product_id: PyObjectId
    added_at: datetime = Field(default_factory=utc_now)

class WishlistRequest(BaseModel):
    product_id: str

class Cart(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[CartItem] = Field(default_factory=list)
    wishlist: List[WishlistItem] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=utc_now)

class CartItemResponse(BaseModel):
    product_id: PyObjectId
    name: str
    image: str
    price: float
    quantity: int
    item_total: float

class WishlistItemResponse(BaseModel):
    product_id: PyObjectId
    name: str
    image: str
    price: float
    added_at: datetime

class CartSummary(BaseModel):
    item_count: int
    subtotal: float
    gst_rate: int = 18
    gst_amount: float
    delivery_charge: float
    free_delivery_eligible: bool
    total: float

class CartResponse(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[CartItemResponse] = Field(default_factory=list)
    summary: CartSummary
    wishlist: List[WishlistItemResponse] = Field(default_factory=list)
    updated_at: datetime

    class Config:
        populate_by_name = True
