import math
from fastapi import HTTPException
from pymongo.errors import PyMongoError
import logging
from app.db.mongodb import products_collection
from app.services.review_service import ReviewService
from app.models.product_model import PaginatedProductResponse, ProductResponse
from app.repo.product_helpers import (
    build_product_query,
    count_products,
    fetch_products,
    fetch_product_by_id,
    fetch_product_by_slug,
    fetch_categories,
)
from app.db.mongodb import sellers_collection
from bson import ObjectId

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
        brand: str = None,
        sub_category: str = None,
        is_featured: bool = None,
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
            search=search,
            brand=brand,
            sub_category=sub_category,
            is_featured=is_featured
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
            serialized_product = ProductService.serialize(product)
            
            # 1. Fetch last 5 reviews
            reviews_data = await ReviewService.get_product_reviews(product_id, page=1, limit=5)
            serialized_product["recent_reviews"] = reviews_data.get("reviews", [])
            
            # 2. Fetch seller details
            seller_id = product.get("seller_id")
            if seller_id:
                # user_id in Sellers collection is stored as string
                seller = await sellers_collection().find_one({"user_id": str(seller_id)})
                if seller:
                    serialized_product["seller_details"] = {
                        "business_name": seller.get("business_name"),
                        "business_type": seller.get("business_type"),
                        "rating": seller.get("rating", 0.0)
                    }
            
            return serialized_product
        return None

    @staticmethod
    async def get_product_by_slug(slug: str):
        product = await fetch_product_by_slug(products_collection(), slug)
        if product:
            serialized_product = ProductService.serialize(product)
            reviews_data = await ReviewService.get_product_reviews(str(product["_id"]), page=1, limit=5)
            serialized_product["recent_reviews"] = reviews_data.get("reviews", [])

            seller_id = product.get("seller_id")
            if seller_id:
                seller = await sellers_collection().find_one({"user_id": str(seller_id)})
                if seller:
                    serialized_product["seller_details"] = {
                        "business_name": seller.get("business_name"),
                        "business_type": seller.get("business_type"),
                        "rating": seller.get("rating", 0.0)
                    }

            return serialized_product
        return None

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
