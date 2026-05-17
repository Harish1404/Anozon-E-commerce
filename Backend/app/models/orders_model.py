from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from enum import Enum
from datetime import datetime
from bson import ObjectId
from app.core.time_utils import utc_now

PyObjectId = Annotated[str, BeforeValidator(str)]

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    partially_delivered = "partially_delivered"
    partially_shipped = "partially_shipped"

class ItemStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"

class PaymentMethod(str, Enum):
    cod = "cod"
    online = "online"

class OrderItem(BaseModel):
    product_id: PyObjectId
    seller_id: PyObjectId
    name: str
    image: str
    price: float
    quantity: int
    item_total: float
    item_status: ItemStatus = Field(default=ItemStatus.pending)

class ShippingAddress(BaseModel):
    full_name: str
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    mobile: str

class OrderSummary(BaseModel):
    subtotal: float
    gst_rate: int = 18
    gst_amount: float
    delivery_charge: float
    total: float

class Order(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    items: List[OrderItem]
    shipping_address: ShippingAddress
    order_status: OrderStatus = Field(default=OrderStatus.pending)
    summary: OrderSummary
    payment_status: PaymentStatus = Field(default=PaymentStatus.pending)
    payment_method: PaymentMethod = Field(default=PaymentMethod.cod)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class OrderResponse(Order):
    class Config:
        populate_by_name = True

class MaskedShippingAddress(BaseModel):
    full_name: str
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str

class SellerOrderResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    items: List[OrderItem]
    shipping_address: MaskedShippingAddress
    order_status: OrderStatus
    seller_total: float
    created_at: datetime
    updated_at: datetime
    payment_status: PaymentStatus
    payment_method: PaymentMethod

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class OrderItemStatusUpdate(BaseModel):
    item_status: ItemStatus

class PlaceOrderRequest(BaseModel):
    address_id: str
    payment_method: PaymentMethod

class BuyNowRequest(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)
    address_id: str
    payment_method: PaymentMethod

