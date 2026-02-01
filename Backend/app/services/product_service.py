from http.client import HTTPException
from app.db.mongodb import products_collection
from bson import ObjectId
import re

async def get_products_service(
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    sort_by: str = "likes",
    sort_order: int = 1,
    page: int = 1,
    limit: int = 30,
):
        query = {}

        # Category filter (case-insensitive)
        if category:
            query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}

        # Price range filter
        if min_price is not None and max_price is not None:
            query["price"] = {"$gte": min_price, "$lte": max_price}
        elif min_price is not None:
            query["price"] = {"$gte": min_price}
        elif max_price is not None:
            query["price"] = {"$lte": max_price}

        # Pagination
        skip = (page - 1) * limit

        # Fetch from DB
        products_cursor = products_collection().find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        products = await products_cursor.to_list(length=limit)

        # Convert ObjectId to string
        for product in products:
            product["_id"] = str(product["_id"])

        return products

async def get_product_by_id_service(product_id: str):
    # 1. Validate if it's a real MongoDB ID
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format")
    
    # 2. Find the product
    product = await products_collection().find_one({"_id": ObjectId(product_id)})
    
    # 3. Convert _id to string for the frontend
    if product:
        product["_id"] = str(product["_id"])
        return product
    
    return None
