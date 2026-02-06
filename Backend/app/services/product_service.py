from http.client import HTTPException
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
