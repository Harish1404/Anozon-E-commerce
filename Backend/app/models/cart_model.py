from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class CartItem(BaseModel):
    product_id: PyObjectId
    quantity: int

class Cart(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[CartItem] = Field(default_factory=list)
    wishlist: List[PyObjectId] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CartItemResponse(BaseModel):
    product_id: PyObjectId
    name: str
    image: str
    price: float
    quantity: int

class CartResponse(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[CartItemResponse] = Field(default_factory=list)
    wishlist: List[PyObjectId] = Field(default_factory=list)
    updated_at: datetime

    class Config:
        populate_by_name = True
