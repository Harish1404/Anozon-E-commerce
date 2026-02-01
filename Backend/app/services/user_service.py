from fastapi import HTTPException, status
from bson import ObjectId
from app.models.user_model import UserInDB
from app.db.mongodb import get_users_collection

class UserService:
    
    # --- ❤️ FAVORITES LOGIC ---
    @staticmethod
    async def toggle_favorite(user_id: str, product_id: str, collection):
        """
        Adds product to favorites if not there, removes it if it is.
        Returns: The new state (True = Added, False = Removed)
        """
        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")

        user = await collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if already favorite
        if product_id in user.get("favorites", []):
            # REMOVE (Unlike)
            await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"favorites": product_id}}
            )
            return {"message": "Removed from favorites", "is_favorite": False}
        else:
            # ADD (Like) - $addToSet prevents duplicates automatically
            await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"favorites": product_id}}
            )
            return {"message": "Added to favorites", "is_favorite": True}

    # --- 🛒 CART LOGIC ---
    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int, collection):
        """
        Adds item to cart. If exists, increases quantity.
        """
        if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        # 1. Check if item already exists in cart
        user = await collection.find_one(
            {"_id": ObjectId(user_id), "cart.product_id": product_id}
        )

        if user:
            # OPTION A: Item exists -> Increase Quantity
            # We use the positional operator $ to find the specific item in the array
            result = await collection.update_one(
                {"_id": ObjectId(user_id), "cart.product_id": product_id},
                {"$inc": {"cart.$.quantity": quantity}}
            )
        else:
            # OPTION B: Item does not exist -> Push new object
            new_item = {"product_id": product_id, "quantity": quantity}
            result = await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"cart": new_item}}
            )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update cart")
            
        return {"message": "Cart updated"}

    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str, collection):
        """
        Removes an item completely from the cart.
        """
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"cart": {"product_id": product_id}}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Product not found in cart")
            
        return {"message": "Item removed from cart"}

    @staticmethod
    async def get_cart(user_id: str, collection):
        """
        Returns the user's cart. 
        Note: In a real app, you would also fetch Product Details (Name, Price, Image) 
        here by doing a 'Lookup' (Join) with the Products collection.
        For now, we return the IDs and let the Frontend fetch details.
        """
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user.get("cart", [])