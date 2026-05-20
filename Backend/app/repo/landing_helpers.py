"""
Landing page database helpers.
All queries use lightweight projections and the standard BASE_FILTER for approved/active products.
"""

import logging
from pymongo.errors import PyMongoError
from pymongo import ReturnDocument
from fastapi import HTTPException
from bson import ObjectId
from app.repo.product_helpers import CARD_PROJECTION

logger = logging.getLogger("uvicorn.error")

# ── Shared constants ──────────────────────────────────────────────────────────

BASE_FILTER = {"is_active": True, "is_deleted": False, "is_approved": True}


# ── Landing section queries ───────────────────────────────────────────────────

async def fetch_categories_with_subcategories(collection) -> list[dict]:
    """
    MongoDB aggregation: group by category, collect distinct sub_categories,
    count products, and grab the image from the highest-rated product.
    """
    try:
        pipeline = [
            {"$match": BASE_FILTER},
            {"$sort": {"avg_rating": -1, "review_count": -1}},
            {"$group": {
                "_id": "$category",
                "sub_categories": {"$addToSet": "$sub_category"},
                "product_count": {"$sum": 1},
                "image_url": {"$first": {"$arrayElemAt": ["$image_urls", 0]}}
            }},
            {"$project": {
                "category": "$_id", "_id": 0,
                "sub_categories": 1, "product_count": 1, "image_url": 1
            }},
            {"$sort": {"product_count": -1}}
        ]
        results = await collection.aggregate(pipeline).to_list(length=100)
        # Filter out None values from sub_categories
        for cat in results:
            cat["sub_categories"] = [s for s in cat.get("sub_categories", []) if s]
        return results
    except PyMongoError as e:
        logger.error(f"DB Error fetching categories with subcategories: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def fetch_flash_deals(collection, min_discount: int = 30, limit: int = 12) -> list[dict]:
    """Products with discount_percent >= threshold, sorted by discount desc."""
    try:
        query = {**BASE_FILTER, "discount_percent": {"$gte": min_discount}, "stock": {"$gt": 0}}
        cursor = collection.find(query, CARD_PROJECTION).sort(
            "discount_percent", -1
        ).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching flash deals: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def fetch_top_products(collection, limit: int = 12) -> list[dict]:
    """Sorted by avg_rating desc, then review_count desc. Requires at least 1 review."""
    try:
        query = {**BASE_FILTER, "review_count": {"$gte": 1}, "stock": {"$gt": 0}}
        cursor = collection.find(query, CARD_PROJECTION).sort(
            [("avg_rating", -1), ("review_count", -1)]
        ).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching top products: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def fetch_new_arrivals(collection, limit: int = 12) -> list[dict]:
    """Sorted by created_at desc — newest products first."""
    try:
        query = {**BASE_FILTER, "stock": {"$gt": 0}}
        cursor = collection.find(query, CARD_PROJECTION).sort(
            "created_at", -1
        ).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching new arrivals: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def fetch_featured_products(collection, limit: int = 8) -> list[dict]:
    """Products marked as is_featured=True."""
    try:
        query = {**BASE_FILTER, "is_featured": True, "stock": {"$gt": 0}}
        cursor = collection.find(query, CARD_PROJECTION).sort(
            [("avg_rating", -1), ("review_count", -1)]
        ).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching featured products: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── Banner queries ────────────────────────────────────────────────────────────

async def fetch_active_banners(collection) -> list[dict]:
    """Active banners sorted by priority (desc) for the landing page carousel."""
    try:
        cursor = collection.find(
            {"is_active": True}
        ).sort("priority", -1)
        return await cursor.to_list(length=20)
    except PyMongoError as e:
        logger.error(f"DB Error fetching banners: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def fetch_all_banners(collection) -> list[dict]:
    """All banners (active + inactive) for admin management view."""
    try:
        cursor = collection.find().sort("priority", -1)
        return await cursor.to_list(length=100)
    except PyMongoError as e:
        logger.error(f"DB Error fetching all banners: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def insert_banner(collection, banner_data: dict) -> dict:
    """Insert a new banner and return the created document."""
    try:
        result = await collection.insert_one(banner_data)
        banner_data["_id"] = result.inserted_id
        return banner_data
    except PyMongoError as e:
        logger.error(f"DB Error inserting banner: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def update_banner_by_id(collection, banner_id: str, update_data: dict) -> dict:
    """Update banner fields and return the updated document."""
    if not ObjectId.is_valid(banner_id):
        raise HTTPException(status_code=400, detail="Invalid Banner ID format")
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(banner_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        if not result:
            raise HTTPException(status_code=404, detail="Banner not found")
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating banner {banner_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def delete_banner_by_id(collection, banner_id: str) -> bool:
    """Delete a banner by ID. Returns True if deleted."""
    if not ObjectId.is_valid(banner_id):
        raise HTTPException(status_code=400, detail="Invalid Banner ID format")
    try:
        result = await collection.delete_one({"_id": ObjectId(banner_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Banner not found")
        return True
    except PyMongoError as e:
        logger.error(f"DB Error deleting banner {banner_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")
