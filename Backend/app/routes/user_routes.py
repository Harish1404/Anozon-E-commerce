from fastapi import APIRouter, Depends, HTTPException,status, Query, Path
from app.services.user_service import UserService
from app.services.product_service import ProductService
from app.deps.roles import require_permission, get_current_user
from app.models.seller_model import SellerApplicationRequest
from app.services.admin_service import apply_for_seller
from app.db.mongodb import get_users_collection, cart_collection
from app.models.user_model import *
from app.models.cart_model import *

router = APIRouter(prefix="/users", tags=["user Features"])

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
    
    # Toggle wishlist in cart collection
    result = await UserService.toggle_favorite(
        user_id=user_id,
        product_id=item.product_id,
        cart_collection=collection
    )
    
    # Update product likes based on toggle result
    if result["is_favorite"]:
        # Added to favorites - increment product likes
        await ProductService.like_product(product_id=item.product_id, user_id=user_id)
    else:
        # Removed from favorites - decrement product likes
        await ProductService.unlike_product(product_id=item.product_id, user_id=user_id)
    
    return result

@router.post("/seller-apply")
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

