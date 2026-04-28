from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from enum import Enum
from datetime import datetime
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class PaymentMethod(str, Enum):
    cod = "cod"
    razorpay = "razorpay"
    stripe = "stripe"

class OrderItem(BaseModel):
    product_id: PyObjectId
    seller_id: PyObjectId
    name: str
    image: str
    price: float
    quantity: int

class ShippingAddress(BaseModel):
    full_name: str
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    mobile: str

class Order(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[OrderItem]
    shipping_address: ShippingAddress
    status: OrderStatus
    subtotal: float
    discount: float
    total: float
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderResponse(Order):
    class Config:
        populate_by_name = True

