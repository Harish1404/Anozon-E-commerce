from fastapi import HTTPException, status
from pymongo.errors import PyMongoError
from bson import ObjectId
import logging

logger = logging.getLogger("uvicorn.error")
from app.repo.user_helpers import get_user_by_id, update_user_favorites
from app.repo.cart_helpers import (
    get_cart_by_user, 
    add_item_to_cart, 
    remove_item_from_cart, 
    update_item_quantity, 
    clear_user_cart,
    update_user_wishlist
)
from app.repo.product_helpers import fetch_product_by_id
from app.db.mongodb import products_collection

class UserService:
    
    # --- ❤️ FAVORITES LOGIC ---
    @staticmethod
    async def toggle_favorite(user_id: str, product_id: str, cart_collection):
        """
        Adds product to wishlist if not there, removes it if it is.
        Returns: The new state (True = Added, False = Removed)
        """
        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")

        cart = await get_cart_by_user(cart_collection, user_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart/Wishlist not found")

        # Check if already in wishlist
        wishlist = cart.get("wishlist", [])
        in_wishlist = any(item.get("product_id") == product_id for item in wishlist)
        
        try:
            if in_wishlist:
                # REMOVE (Unlike)
                logger.info(f"Removing product {product_id} from wishlist for user {user_id}")
                await update_user_wishlist(cart_collection, user_id, product_id, 'remove')
                return {"message": "Removed from wishlist", "is_favorite": False}
            else:
                # ADD (Like)
                logger.info(f"Adding product {product_id} to wishlist for user {user_id}")
                await update_user_wishlist(cart_collection, user_id, product_id, 'add')
                return {"message": "Added to wishlist", "is_favorite": True}
        except PyMongoError as e:
            logger.error(f"Error toggling wishlist for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")

    @staticmethod
    async def get_wishlist(user_id: str, cart_collection):
        """
        Returns the user's wishlist items.
        """
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        cart = await get_cart_by_user(cart_collection, user_id)

        if not cart:
            return []
        
        return cart.get("wishlist", [])

    # --- 🛒 CART LOGIC ---
    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int, cart_collection):
        """
        Adds item to cart. If exists, increases quantity.
        """
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        
        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        # Check stock limits
        product = await fetch_product_by_id(products_collection(), product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Get current cart quantity to ensure total doesn't exceed stock
        cart = await get_cart_by_user(cart_collection, user_id)
        current_qty = 0
        if cart:
            for item in cart.get("items", []):
                if str(item.get("product_id")) == str(product_id):
                    current_qty = item.get("quantity", 0)
                    break

        if current_qty + quantity > product.get("stock", 0):
            available = product.get("stock", 0) - current_qty
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot add {quantity} items. Only {available} more available in stock."
            )

        try:
            result = await add_item_to_cart(cart_collection, user_id, product_id, quantity)
        except PyMongoError as e:
            logger.error(f"Error adding to cart for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")

        if result.modified_count == 0 and result.upserted_id is None and result.matched_count == 0:
             # This might happen if the cart document doesn't exist for the user yet
             # But our verify_otp now ensures it exists.
             logger.error(f"Failed to update cart for user {user_id}")
             raise HTTPException(status_code=400, detail="Failed to update cart")
            
        logger.info(f"Product {product_id} added to cart for user {user_id}")
        return {"message": "Cart updated"}

    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str, cart_collection):
        """
        Removes an item completely from the cart.
        """
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        try:
            result = await remove_item_from_cart(cart_collection, user_id, product_id)
        except PyMongoError as e:
            logger.error(f"Error removing from cart for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")
        
        if result.modified_count == 0:
            logger.error(f"Product {product_id} not found in cart for user {user_id}")
            raise HTTPException(status_code=404, detail="Product not found in cart")
            
        logger.info(f"Product {product_id} removed from cart for user {user_id}")
        return {"message": "Item removed from cart"}
    
    @staticmethod
    async def update_cart_quantity(user_id: str, product_id: str, quantity: int, cart_collection):
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        # Check stock limits
        product = await fetch_product_by_id(products_collection(), product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if quantity > product.get("stock", 0):
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot update to {quantity} items. Only {product.get('stock', 0)} available in stock."
            )

        try:
            result = await update_item_quantity(cart_collection, user_id, product_id, quantity)
        except PyMongoError as e:
            logger.error(f"Error updating cart quantity for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")

        if result.modified_count == 0:
            logger.error(f"Product {product_id} not found in cart for user {user_id}")
            raise HTTPException(
                status_code=404,
                detail="Product not found in cart"
            )

        logger.info(f"Cart quantity updated for product {product_id}, user {user_id}")
        return {"message": "Cart quantity updated"}

    @staticmethod
    async def get_cart(user_id: str, cart_collection):
        """
        Returns the user's cart items.
        """
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        cart = await get_cart_by_user(cart_collection, user_id)

        if not cart:
            # If no cart document found, return empty list
            return []
        
        return cart.get("items", [])
    
    @staticmethod
    async def clear_cart(user_id: str, cart_collection):
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")

        result = await clear_user_cart(cart_collection, user_id)

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Cart not found for user")

        return {"message": "Cart cleared successfully"}


