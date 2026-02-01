from fastapi import APIRouter, Depends, HTTPException,status, Query, Path
from app.services.user_service import UserService
from app.deps.auth import get_current_user
from app.db.mongodb import get_users_collection
from app.models.user_model import *

router = APIRouter(prefix="/users", tags=["user Features"])

@router.get("/cart")
async def get_my_cart(
    current_user = Depends(get_current_user),
    collection = Depends(get_users_collection)
):
    """View my cart items"""
    # In a real app, you would also fetch product details (name, price) here
    return await UserService.get_cart(str(current_user["_id"]), collection)

@router.post("/cart", status_code=200)
async def add_to_cart(
    item: CartRequest,
    current_user = Depends(get_current_user),
    collection = Depends(get_users_collection)
):
    """Add item or increase quantity"""
    return await UserService.add_to_cart(
        user_id=str(current_user["_id"]),
        product_id=item.product_id,
        quantity=item.quantity,
        collection=collection
    )

@router.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user = Depends(get_current_user),
    collection = Depends(get_users_collection)
):
    """Remove item completely from cart"""
    return await UserService.remove_from_cart(
        user_id=str(current_user["_id"]),
        product_id=product_id,
        collection=collection
    )

# --- ❤️ FAVORITES ENDPOINTS ---

@router.get("/favorites")
async def get_my_favorites(
    current_user = Depends(get_current_user)
):
    """View my favorite product IDs"""
    # Favorites are already inside the user object from the dependency!
    return current_user.get("favorites", [])

@router.post("/favorites/toggle")
async def toggle_favorite(
    item: FavoriteRequest,
    current_user = Depends(get_current_user),
    collection = Depends(get_users_collection)
):
    """Like or Unlike a product"""
    return await UserService.toggle_favorite(
        user_id=str(current_user["_id"]),
        product_id=item.product_id,
        collection=collection
    )