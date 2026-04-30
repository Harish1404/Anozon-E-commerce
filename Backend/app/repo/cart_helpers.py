from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
import logging

logger = logging.getLogger("uvicorn.error")

def cart_to_db(user_id: str) -> dict:
    """Structure for a new cart document."""
    return {
        "user_id": ObjectId(user_id),
        "items": [],
        "wishlist": [],
        "updated_at": datetime.utcnow()
    }

async def create_empty_cart(collection, user_id: str):
    """Inserts a new cart document for the user."""
    try:
        cart_data = cart_to_db(user_id)
        result = await collection.insert_one(cart_data)
        return result
    except PyMongoError as e:
        logger.error(f"Error creating cart for user {user_id}: {e}")
        raise e

async def get_cart_by_user(collection, user_id: str):
    """Fetches the cart document for a user."""
    try:
        return await collection.find_one({"user_id": ObjectId(user_id)})
    except PyMongoError as e:
        logger.error(f"Error fetching cart for user {user_id}: {e}")
        raise e

async def add_item_to_cart(collection, user_id: str, product_id: str, quantity: int):
    """Adds an item to the cart or increments quantity if it exists."""
    try:
        # Check if item exists in cart
        exists = await collection.find_one({"user_id": ObjectId(user_id), "items.product_id": product_id})
        
        if exists:
            result = await collection.update_one(
                {"user_id": ObjectId(user_id), "items.product_id": product_id},
                {"$inc": {"items.$.quantity": quantity}, "$set": {"updated_at": datetime.utcnow()}}
            )
        else:
            new_item = {"product_id": product_id, "quantity": quantity}
            result = await collection.update_one(
                {"user_id": ObjectId(user_id)},
                {"$push": {"items": new_item}, "$set": {"updated_at": datetime.utcnow()}}
            )
        return result
    except PyMongoError as e:
        logger.error(f"Error adding item to cart for user {user_id}: {e}")
        raise e

async def remove_item_from_cart(collection, user_id: str, product_id: str):
    """Removes an item from the cart."""
    try:
        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$pull": {"items": {"product_id": product_id}}, "$set": {"updated_at": datetime.utcnow()}}
        )
        return result
    except PyMongoError as e:
        logger.error(f"Error removing item from cart for user {user_id}: {e}")
        raise e

async def update_item_quantity(collection, user_id: str, product_id: str, quantity: int):
    """Updates the quantity of an item in the cart."""
    try:
        result = await collection.update_one(
            {"user_id": ObjectId(user_id), "items.product_id": product_id},
            {"$set": {"items.$.quantity": quantity, "updated_at": datetime.utcnow()}}
        )
        return result
    except PyMongoError as e:
        logger.error(f"Error updating item quantity for user {user_id}: {e}")
        raise e

async def clear_user_cart(collection, user_id: str):
    """Clears all items from the cart."""
    try:
        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"items": [], "updated_at": datetime.utcnow()}}
        )
        return result
    except PyMongoError as e:
        logger.error(f"Error clearing cart for user {user_id}: {e}")
        raise e

async def update_user_wishlist(collection, user_id: str, product_id: str, action: str):
    """
    action: 'add' or 'remove'
    Returns: bool (True if added/removed successfully, False if already exists/doesn't exist)
    """
    try:
        if action == 'add':
            exists = await collection.find_one({"user_id": ObjectId(user_id), "wishlist.product_id": product_id})
            if not exists:
                new_item = {"product_id": product_id, "added_at": datetime.utcnow()}
                await collection.update_one(
                    {"user_id": ObjectId(user_id)},
                    {"$push": {"wishlist": new_item}, "$set": {"updated_at": datetime.utcnow()}}
                )
                return True
            return False # Already in wishlist
        else:
            result = await collection.update_one(
                {"user_id": ObjectId(user_id)},
                {"$pull": {"wishlist": {"product_id": product_id}}, "$set": {"updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"Error updating wishlist for user {user_id}: {e}")
        raise e

