from bson import ObjectId
from pymongo.errors import PyMongoError, DuplicateKeyError
from fastapi import HTTPException
import logging

logger = logging.getLogger("uvicorn.error")


async def insert_review(collection, review_data: dict) -> str:
    """Insert a review document. Returns the inserted ID as string.
    Raises 409 if duplicate (product_id + user_id compound index)."""
    try:
        result = await collection.insert_one(review_data)
        return str(result.inserted_id)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="You have already reviewed this product")
    except PyMongoError as e:
        logger.error(f"DB Error inserting review: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit review")


async def get_reviews_by_product(collection, product_id: str, skip: int = 0, limit: int = 20) -> list:
    """Fetch reviews for a product, newest first."""
    try:
        cursor = collection.find(
            {"product_id": product_id}
        ).sort("reviewed_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching reviews for product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reviews")


async def get_review_count_by_product(collection, product_id: str) -> int:
    """Count total reviews for a product."""
    try:
        return await collection.count_documents({"product_id": product_id})
    except PyMongoError as e:
        logger.error(f"DB Error counting reviews for product {product_id}: {e}")
        return 0


async def check_existing_review(collection, product_id: str, user_id: str) -> bool:
    """Check if a user has already reviewed a product."""
    try:
        existing = await collection.find_one({
            "product_id": product_id,
            "user_id": user_id
        })
        return existing is not None
    except PyMongoError as e:
        logger.error(f"DB Error checking existing review: {e}")
        return False
