from fastapi import HTTPException
from app.db.mongodb import products_collection
from bson import ObjectId
import re

class ProductService:

    @staticmethod
    async def get_products(
        category: str = None,
        min_price: float = None,
        max_price: float = None,
        sort_by: str = "likes",
        sort_order: int = 1,
        page: int = 1,
        limit: int = 30,
    ):
        query = {}

        if category:
            query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}

        if min_price is not None and max_price is not None:
            query["price"] = {"$gte": min_price, "$lte": max_price}
        elif min_price is not None:
            query["price"] = {"$gte": min_price}
        elif max_price is not None:
            query["price"] = {"$lte": max_price}

        skip = (page - 1) * limit

        products_cursor = (
            products_collection()
            .find(query)
            .sort(sort_by, sort_order)
            .skip(skip)
            .limit(limit)
        )

        products = await products_cursor.to_list(length=limit)

        for product in products:
            product["_id"] = str(product["_id"])

        return products

    @staticmethod
    async def get_product_by_id(product_id: str):
        
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid Product ID format")

        product = await products_collection().find_one({"_id": ObjectId(product_id)})

        if product:
            product["_id"] = str(product["_id"])
            return product

        return None

    @staticmethod
    async def like_product(product_id: str, user_id: str):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid Product ID")
        
        # Check if product exists
        product = await products_collection().find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Initialize fields if they don't exist
        if "liked_by" not in product:
            await products_collection().update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"liked_by": [], "likes": 0}}
            )
        
        # Add user to liked_by array
        result = await products_collection().update_one(
            {"_id": ObjectId(product_id)},
            {"$addToSet": {"liked_by": user_id}}
        )

        # Only increment if user was actually added
        if result.modified_count > 0:
            await products_collection().update_one(
                {"_id": ObjectId(product_id)},
                {"$inc": {"likes": 1}}
            )

    @staticmethod
    async def unlike_product(product_id: str, user_id: str):
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid Product ID")
        
        # Check if product exists
        product = await products_collection().find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Remove user from liked_by array
        result = await products_collection().update_one(
            {"_id": ObjectId(product_id)},
            {"$pull": {"liked_by": user_id}}
        )

        # Only decrement if user was actually removed
        if result.modified_count > 0:
            await products_collection().update_one(
                {"_id": ObjectId(product_id)},
                {"$inc": {"likes": -1}}
            )

    @staticmethod
    async def get_product_by_category(category: str, page: int = 1, limit: int = 30):
    # Create case-insensitive regex pattern for exact category match
        category_pattern = {"$regex": f"^{re.escape(category)}$", "$options": "i"}

        # Calculate skip value for pagination
        skip = (page - 1) * limit

        # Use aggregation pipeline for better performance and flexibility
        pipeline = [
            {"$match": {"category": category_pattern}},
            {"$sort": {"likes": -1}},  # Sort by likes in descending order
            {"$skip": skip},
            {"$limit": limit},
            {"$project": {
                "_id": {"$toString": "$_id"},  # Convert ObjectId to string in query
                "name": 1,
                "category": 1,
                "price": 1,
                "likes": 1,
                "description": 1,
                "image_url": 1,
                "created_at": 1
            }}
        ]

        # Execute aggregation pipeline
        products_cursor = products_collection().aggregate(pipeline)
        return await products_cursor.to_list(length=limit)

    @staticmethod
    async def get_categories():
        # Get distinct categories efficiently
        categories = await products_collection().distinct("category")
        return sorted(categories, key=str.lower)  # Return alphabetically sorted categories

    @staticmethod
    async def get_category_count(category: str):
        # Get count of products in a specific category
        category_pattern = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
        return await products_collection().count_documents(
            {"category": category_pattern}
        )      

