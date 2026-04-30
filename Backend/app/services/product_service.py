import math
from fastapi import HTTPException
from pymongo.errors import PyMongoError
import logging
from app.db.mongodb import products_collection
from app.models.product_model import PaginatedProductResponse, ProductResponse
from app.repo.product_helpers import (
    build_product_query,
    count_products,
    fetch_products,
    fetch_product_by_id,
    fetch_categories,
    update_product_likes
)

logger = logging.getLogger("uvicorn.error")


class ProductService:
    @staticmethod
    def serialize(product):
        product["_id"] = str(product["_id"])
        # Ensure fallback for required fields in case older DB documents miss them
        return product

    @staticmethod
    async def get_products(
        category: str = None,
        min_price: float = None,
        max_price: float = None,
        min_discount: int = None,
        min_rating: float = None,
        in_stock: bool = None,
        search: str = None,
        sort_by: str = "created_at",
        sort_order: int = -1,
        page: int = 1,
        limit: int = 30,
    ) -> PaginatedProductResponse:
        
        # 1. Build Query Dictionary
        query = build_product_query(
            category=category,
            min_price=min_price,
            max_price=max_price,
            min_discount=min_discount,
            min_rating=min_rating,
            in_stock=in_stock,
            search=search
        )

        # 2. Pagination Math
        skip = (page - 1) * limit
        
        # 3. Fetch from DB
        collection = products_collection()
        try:
            total_items = await count_products(collection, query)
            raw_products = await fetch_products(collection, query, sort_by, sort_order, skip, limit)
        except PyMongoError as e:
            logger.error(f"Error fetching products: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        
        # 4. Serialize & Calculate Pages
        serialized_products = [ProductService.serialize(p) for p in raw_products]
        total_pages = math.ceil(total_items / limit) if limit > 0 else 0

        logger.info(f"Fetched {len(serialized_products)} products for page {page}")
        # 5. Map to Model
        return PaginatedProductResponse(
            items=serialized_products,
            total=total_items,
            page=page,
            limit=limit,
            pages=total_pages
        )

    @staticmethod
    async def get_product_by_id(product_id: str):
        product = await fetch_product_by_id(products_collection(), product_id)
        if product:
            return ProductService.serialize(product)
        return None

    @staticmethod
    async def like_product(product_id: str, user_id: str):
        # We assume checking the product exists is done, but the helper handles it efficiently via update.
        # To strictly enforce 404 if not found:
        product = await fetch_product_by_id(products_collection(), product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        
        logger.info(f"User {user_id} liked product {product_id}")
        try:
            await update_product_likes(products_collection(), product_id, user_id, action="like")
        except PyMongoError as e:
            logger.error(f"Error liking product {product_id} for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")

    @staticmethod
    async def unlike_product(product_id: str, user_id: str):
        product = await fetch_product_by_id(products_collection(), product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        
        logger.info(f"User {user_id} unliked product {product_id}")
        try:
            await update_product_likes(products_collection(), product_id, user_id, action="unlike")
        except PyMongoError as e:
            logger.error(f"Error unlinking product {product_id} for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")

    @staticmethod
    async def get_categories():
        return await fetch_categories(products_collection())

    # We keep search_products as a shorthand that just routes to get_products 
    # to not break existing strict search routes immediately, but it now benefits from the paginated model.
    @classmethod
    async def search_products(cls, query: str, page: int = 1, limit: int = 30):
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
        logger.info(f"Searching for products with query: {query}")
        return await cls.get_products(search=query.strip(), page=page, limit=limit)

    @classmethod
    async def get_product_by_category(cls, category: str, page: int = 1, limit: int = 30):
        return await cls.get_products(category=category, page=page, limit=limit)
