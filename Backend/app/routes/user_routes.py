from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from typing import List, Optional, Annotated
from app.services.user_service import UserService
from app.services.product_service import ProductService
from app.services.profile_service import ProfileService
from app.services.order_service import OrderService
from app.deps.roles import require_permission, get_current_user
from app.models.seller_model import SellerApplicationRequest
from app.services.admin_service import apply_for_seller
from app.db.mongodb import get_users_collection, cart_collection
from app.models.user_model import *
from app.models.cart_model import *
from app.models.profiles_model import UpdateProfileRequest, AddAddressRequest, UpdateAddressRequest
from app.models.orders_model import PlaceOrderRequest, BuyNowRequest

router = APIRouter(prefix="/users", tags=["User Features"])

# --- 👤 PROFILE & ADDRESS ENDPOINTS ---

@router.get("/profile")
async def get_user_profile(current_user = Depends(get_current_user)):
    """Get user profile details and addresses"""
    return await ProfileService.get_profile(str(current_user["_id"]))

@router.put("/profile")
async def update_user_profile(
    payload: UpdateProfileRequest,
    current_user = Depends(get_current_user)
):
    """Update basic user information"""
    return await ProfileService.update_profile(str(current_user["_id"]), payload.model_dump(exclude_unset=True))

@router.post("/addresses", status_code=status.HTTP_201_CREATED)
async def add_user_address(
    payload: AddAddressRequest,
    current_user = Depends(get_current_user)
):
    """Add a new delivery address"""
    return await ProfileService.add_address(str(current_user["_id"]), payload.model_dump())

@router.put("/addresses/{address_id}")
async def update_user_address(
    address_id: str,
    payload: UpdateAddressRequest,
    current_user = Depends(get_current_user)
):
    """Update an existing address"""
    return await ProfileService.update_address(str(current_user["_id"]), address_id, payload.model_dump(exclude_unset=True))

@router.delete("/addresses/{address_id}")
async def delete_user_address(
    address_id: str,
    current_user = Depends(get_current_user)
):
    """Delete an address"""
    return await ProfileService.delete_address(str(current_user["_id"]), address_id)


# --- 🛒 CART ENDPOINTS ---

@router.get("/cart")
async def get_my_cart(
    current_user = Depends(get_current_user),
    collection = Depends(cart_collection)
):
    """View my cart items"""
    return await UserService.get_cart(str(current_user["_id"]), collection)

@router.post("/cart", status_code=200)
async def add_to_cart(
    item: CartItem,
    current_user = Depends(get_current_user),
    collection = Depends(cart_collection)
):
    """Add item or increase quantity"""
    return await UserService.add_to_cart(
        user_id=str(current_user["_id"]),
        product_id=item.product_id,
        quantity=item.quantity,
        cart_collection=collection
    )

@router.put("/cart", status_code=200)
async def update_cart(
    item: CartItem,
    current_user = Depends(get_current_user),
    collection = Depends(cart_collection)
):
    """Set the exact quantity for an item in the cart"""
    return await UserService.update_cart_quantity(
        user_id=str(current_user["_id"]),
        product_id=item.product_id,
        quantity=item.quantity,
        cart_collection=collection
    )

@router.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user = Depends(get_current_user),
    collection = Depends(cart_collection)
):
    """Remove item completely from cart"""
    return await UserService.remove_from_cart(
        user_id=str(current_user["_id"]),
        product_id=product_id,
        cart_collection=collection
    )


# --- ❤️ FAVORITES / WISHLIST ENDPOINTS ---

@router.get("/favorites")
async def get_my_favorites(
    current_user = Depends(get_current_user),
    collection = Depends(cart_collection)
):
    """View my favorite/wishlist items"""
    return await UserService.get_wishlist(str(current_user["_id"]), collection)

@router.post("/favorites/toggle")
async def toggle_favorite(
    item: WishlistRequest,
    current_user = Depends(get_current_user),
    collection = Depends(cart_collection)
):
    """Like or Unlike a product (Wishlist)"""
    if not item.product_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product ID is required")
    
    user_id = str(current_user["_id"])
    
    # Toggle wishlist in cart collection (Internal logic now handles product like sync)
    result = await UserService.toggle_favorite(
        user_id=user_id,
        product_id=item.product_id,
        cart_collection=collection
    )
    
    return result



# --- 📦 ORDER ENDPOINTS ---

@router.get("/orders")
async def get_user_orders(
    status: str = Query(None, description="Filter by order status"),
    current_user = Depends(get_current_user)
):
    """List all own orders"""
    return await OrderService.get_user_orders(str(current_user["_id"]), status)

@router.get("/orders/{order_id}")
async def get_order_detail(
    order_id: str,
    current_user = Depends(get_current_user)
):
    """Single order detail with full tracking"""
    return await OrderService.get_order_by_id(str(current_user["_id"]), order_id)

@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def place_order(
    payload: PlaceOrderRequest,
    current_user = Depends(get_current_user)
):
    """Place order from cart"""
    return await OrderService.place_order(
        str(current_user["_id"]),
        payload.address_id,
        payload.payment_method
    )

@router.post("/orders/buy-now", status_code=201)
async def buy_now(
    payload: BuyNowRequest,
    current_user = Depends(get_current_user)
):
    """Place an order for a single product directly (Buy Now — no cart required)"""
    return await OrderService.buy_now(
        user_id=str(current_user["_id"]),
        product_id=payload.product_id,
        quantity=payload.quantity,
        address_id=payload.address_id,
        payment_method=payload.payment_method
    )

@router.patch("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    product_id: Optional[str] = Query(None, description="Optional product ID to cancel only a specific item"),
    current_user = Depends(get_current_user)
):
    """Cancel order or a specific item — pending/confirmed items only"""
    return await OrderService.cancel_order(str(current_user["_id"]), order_id, product_id)


# --- Seller Application Endpoints ---

@router.post("/seller-apply", status_code=status.HTTP_201_CREATED)
async def submit_seller_application(
    payload: SellerApplicationRequest,
    current_user: dict = Depends(require_permission("seller:apply"))
):
    """
    Submit an application to become a seller.
    Only users with 'seller:apply' permission (i.e., regular users) can do this.
    """
    email = current_user.get("email")
    user = await get_users_collection().find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return await apply_for_seller(str(user["_id"]), payload)

@router.get("/seller-apply/status")
async def check_seller_application_status(
    current_user: dict = Depends(get_current_user)
):
    """Check own seller application status and remaining attempts"""
    from app.services.admin_service import get_seller_application_status
    email = current_user.get("email")
    user = await get_users_collection().find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await get_seller_application_status(str(user["_id"]))

