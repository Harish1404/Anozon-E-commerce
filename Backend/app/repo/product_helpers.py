import logging
import re
from bson import ObjectId
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from typing import Optional

logger = logging.getLogger("uvicorn.error")

def build_product_query(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_discount: Optional[int] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    search: Optional[str] = None,
    brand: Optional[str] = None,
    sub_category: Optional[str] = None,
    tags: Optional[str] = None,
    is_featured: Optional[bool] = None,
    include_unapproved: bool = False
) -> dict:
    query = {}
    
    # 1. Search (Text or Regex depending on what we want. We'll use Regex for flexible matching across name/description)
    if search:
        escaped_search = re.escape(search)
        query["$or"] = [
            {"name": {"$regex": escaped_search, "$options": "i"}},
            {"description": {"$regex": escaped_search, "$options": "i"}},
            {"brand": {"$regex": escaped_search, "$options": "i"}},
            {"sub_category": {"$regex": escaped_search, "$options": "i"}},
            {"search_keywords": {"$regex": escaped_search, "$options": "i"}},
            {"tags": {"$regex": escaped_search, "$options": "i"}}
        ]

    # 2. Category (supports comma separated)
    if category:
        categories = [c.strip() for c in category.split(",") if c.strip()]
        if len(categories) == 1:
            query["category"] = {"$regex": f"^{re.escape(categories[0])}$", "$options": "i"}
        elif len(categories) > 1:
            # Match any of the categories
            query["category"] = {"$in": [re.compile(f"^{re.escape(c)}$", re.IGNORECASE) for c in categories]}

    # 2.5. Brand (supports comma separated)
    if brand:
        brands = [b.strip() for b in brand.split(",") if b.strip()]
        if len(brands) == 1:
            query["brand"] = {"$regex": f"^{re.escape(brands[0])}$", "$options": "i"}
        elif len(brands) > 1:
            # Match any of the brands
            query["brand"] = {"$in": [re.compile(f"^{re.escape(b)}$", re.IGNORECASE) for b in brands]}

    # 2.6. Sub Category (supports comma separated)
    if sub_category:
        sub_categories = [s.strip() for s in sub_category.split(",") if s.strip()]
        if len(sub_categories) == 1:
            query["sub_category"] = {"$regex": f"^{re.escape(sub_categories[0])}$", "$options": "i"}
        elif len(sub_categories) > 1:
            # Match any of the subcategories
            query["sub_category"] = {"$in": [re.compile(f"^{re.escape(s)}$", re.IGNORECASE) for s in sub_categories]}

    # 2.7. Tags (supports comma separated, matches any tag)
    if tags:
        tags_list = [t.strip() for t in tags.split(",") if t.strip()]
        if len(tags_list) == 1:
            query["tags"] = {"$regex": f"^{re.escape(tags_list[0])}$", "$options": "i"}
        elif len(tags_list) > 1:
            # Match any of the tags
            query["tags"] = {"$in": [re.compile(f"^{re.escape(t)}$", re.IGNORECASE) for t in tags_list]}

    # 3. Price Filter
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query

    # 4. Discount Filter
    if min_discount is not None:
        query["discount_percent"] = {"$gte": min_discount}

    # 5. Rating Filter
    if min_rating is not None:
        query["avg_rating"] = {"$gte": min_rating}

    # 5.5. Is Featured Filter
    if is_featured is not None:
        query["is_featured"] = is_featured

    # 6. Stock Filter
    if in_stock is not None:
        if in_stock:
            query["stock"] = {"$gt": 0}
        else:
            query["stock"] = 0
            
    # Default: Always only show active products on user end
    query["is_active"] = True
    query["is_deleted"] = False
    
    if not include_unapproved:
        query["is_approved"] = True

    return query

async def fetch_products(collection, query: dict, sort_by: str, sort_order: int, skip: int, limit: int):
    try:
        # Validate sort_by field to avoid Mongo injection
        valid_sort_fields = {"price", "avg_rating", "created_at", "discount_percent", "product_likes", "review_count"}
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"
            
        cursor = collection.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def count_products(collection, query: dict) -> int:
    try:
        return await collection.count_documents(query)
    except PyMongoError as e:
        logger.error(f"DB Error counting products: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def fetch_product_by_id(collection, product_id: str, only_approved: bool = True):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format")
    try:
        query = {"_id": ObjectId(product_id), "is_deleted": False}
        if only_approved:
            query["is_approved"] = True
            query["is_active"] = True
        return await collection.find_one(query)
    except PyMongoError as e:
        logger.error(f"DB Error fetching product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def fetch_product_by_slug(collection, slug: str, only_approved: bool = True):
    try:
        query = {"slug": slug, "is_deleted": False}
        if only_approved:
            query["is_approved"] = True
            query["is_active"] = True
        return await collection.find_one(query)
    except PyMongoError as e:
        logger.error(f"DB Error fetching product by slug {slug}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def fetch_categories(collection):
    try:
        categories = await collection.distinct("category")
        return sorted(categories, key=str.lower)
    except PyMongoError as e:
        logger.error(f"DB Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_product_likes(collection, product_id: str, user_id: str, action: str):
    """
    action: "like" or "unlike"
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format")
        
    try:
        if action == "like":
            # Initialize fields if they don't exist separately
            await collection.update_one(
                {"_id": ObjectId(product_id), "liked_by": {"$exists": False}},
                {"$set": {"liked_by": []}}
            )
            await collection.update_one(
                {"_id": ObjectId(product_id), "product_likes": {"$exists": False}},
                {"$set": {"product_likes": 0}}
            )
            # Add user and increment
            result = await collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$addToSet": {"liked_by": user_id}}
            )
            if result.modified_count > 0:
                await collection.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$inc": {"product_likes": 1}}
                )
        elif action == "unlike":
            # Remove user and decrement
            result = await collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$pull": {"liked_by": user_id}}
            )
            if result.modified_count > 0:
                await collection.update_one(
                    {"_id": ObjectId(product_id), "product_likes": {"$gt": 0}},
                    {"$inc": {"product_likes": -1}}
                )
    except PyMongoError as e:
        logger.error(f"DB Error updating product likes {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def decrement_product_stock(collection, product_id: str, quantity: int) -> bool:
    try:
        result = await collection.update_one(
            {"_id": ObjectId(product_id), "stock": {"$gte": quantity}},
            {"$inc": {"stock": -quantity}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error decrementing stock for {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def increment_product_stock(collection, product_id: str, quantity: int) -> bool:
    try:
        result = await collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"stock": quantity}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error incrementing stock for {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")
