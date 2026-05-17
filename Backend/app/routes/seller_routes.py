from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from app.deps.roles import require_permission, get_current_user
from app.services.seller_service import SellerService
from app.models.product_model import ProductCreate, ProductUpdate, ProductStockUpdate, ProductToggleRequest
from app.models.orders_model import OrderItemStatusUpdate
from app.models.seller_model import SellerProfileUpdate

router = APIRouter(prefix="/seller", tags=["Seller Dashboard"])

# --- Profile ---
@router.get("/profile", dependencies=[Depends(require_permission("seller_profile:own:write"))])
async def get_seller_profile(user=Depends(get_current_user)):
    return await SellerService.get_profile(str(user["_id"]))

@router.put("/profile", dependencies=[Depends(require_permission("seller_profile:own:write"))])
async def update_seller_profile_put(profile_data: SellerProfileUpdate, user=Depends(get_current_user)):
    return await SellerService.update_profile(str(user["_id"]), profile_data)

@router.patch("/profile", dependencies=[Depends(require_permission("seller_profile:own:write"))])
async def update_seller_profile_patch(profile_data: SellerProfileUpdate, user=Depends(get_current_user)):
    return await SellerService.update_profile(str(user["_id"]), profile_data)

# --- Dashboard ---
@router.get("/dashboard", dependencies=[Depends(require_permission("product:own:write"))])
async def get_seller_dashboard(user=Depends(get_current_user)):
    return await SellerService.get_dashboard(str(user["_id"]))

# --- Products ---
@router.post("/products", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("product:own:write"))])
async def create_product(product_data: ProductCreate, user=Depends(get_current_user)):
    return await SellerService.create_product(str(user["_id"]), product_data)

@router.get("/products", dependencies=[Depends(require_permission("product:own:write"))])
async def get_products(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), user=Depends(get_current_user)):
    return await SellerService.get_products(str(user["_id"]), page, limit)

@router.get("/products/{product_id}", dependencies=[Depends(require_permission("product:own:write"))])
async def get_product_by_id(product_id: str, user=Depends(get_current_user)):
    return await SellerService.get_product_by_id(str(user["_id"]), product_id)

@router.put("/products/{product_id}", dependencies=[Depends(require_permission("product:own:write"))])
async def update_product(product_id: str, product_data: ProductUpdate, user=Depends(get_current_user)):
    return await SellerService.update_product(str(user["_id"]), product_id, product_data)

@router.patch("/products/{product_id}/toggle", dependencies=[Depends(require_permission("product:own:write"))])
async def toggle_product(product_id: str, toggle_data: ProductToggleRequest, user=Depends(get_current_user)):
    return await SellerService.toggle_product(str(user["_id"]), product_id, toggle_data)

@router.patch("/products/{product_id}/stock", dependencies=[Depends(require_permission("product:own:write"))])
async def update_product_stock(product_id: str, stock_data: ProductStockUpdate, user=Depends(get_current_user)):
    return await SellerService.update_stock(str(user["_id"]), product_id, stock_data)

@router.delete("/products/{product_id}", dependencies=[Depends(require_permission("product:own:delete"))])
async def delete_product(product_id: str, user=Depends(get_current_user)):
    return await SellerService.delete_product(str(user["_id"]), product_id)

# --- Orders ---
@router.get("/orders", dependencies=[Depends(require_permission("order:own:view"))])
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by item status"),
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    user=Depends(get_current_user)
):
    return await SellerService.get_orders(str(user["_id"]), page, limit, status=status, year=year, month=month)

@router.get("/orders/{order_id}", dependencies=[Depends(require_permission("order:own:view"))])
async def get_order_by_id(order_id: str, user=Depends(get_current_user)):
    return await SellerService.get_order_by_id(str(user["_id"]), order_id)

@router.patch("/orders/{order_id}/items/{product_id}/status", dependencies=[Depends(require_permission("order:own:status:update"))])
async def update_order_status(order_id: str, product_id: str, status_data: OrderItemStatusUpdate, user=Depends(get_current_user)):
    return await SellerService.update_order_status(str(user["_id"]), order_id, product_id, status_data)

# --- Reviews (read-only for sellers) ---
@router.get("/products/{product_id}/reviews", dependencies=[Depends(require_permission("product:own:write"))])
async def get_product_reviews(product_id: str, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=50), user=Depends(get_current_user)):
    from app.services.review_service import ReviewService
    return await ReviewService.get_seller_product_reviews(str(user["_id"]), product_id, page, limit)

