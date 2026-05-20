"""
Landing page service.
Orchestrates landing page data with Redis caching and parallel DB queries.
Also handles Banner CRUD operations with cache invalidation.
"""

import asyncio
import json
import logging
from fastapi import HTTPException

from app.db.redis import redis_client
from app.db.mongodb import products_collection, banners_collection
from app.core.time_utils import utc_now
from app.repo.landing_helpers import (
    fetch_categories_with_subcategories,
    fetch_flash_deals,
    fetch_top_products,
    fetch_new_arrivals,
    fetch_featured_products,
    fetch_active_banners,
    fetch_all_banners,
    insert_banner,
    update_banner_by_id,
    delete_banner_by_id,
)

logger = logging.getLogger("uvicorn.error")

LANDING_CACHE_KEY = "landing:page:data"
LANDING_CACHE_TTL = 300  # 5 minutes


def _serialize_doc(doc: dict) -> dict:
    """Convert a single MongoDB document for JSON serialization (ObjectId → str) safely without mutating in-place."""
    doc_copy = dict(doc)
    if "_id" in doc_copy:
        doc_copy["_id"] = str(doc_copy["_id"])
    return doc_copy


def _serialize_card(doc: dict) -> dict:
    """Convert a raw product document into a ProductCard-shaped dict safely without mutating in-place."""
    card = _serialize_doc(doc)
    # Extract first image from image_urls array
    image_urls = card.pop("image_urls", None)
    if image_urls and isinstance(image_urls, list) and len(image_urls) > 0:
        card["image_url"] = image_urls[0]
    else:
        card["image_url"] = None
    # Compute in_stock from stock field
    stock = card.pop("stock", 0)
    card["in_stock"] = stock > 0 if stock is not None else False
    return card


def _serialize_cards(docs: list[dict]) -> list[dict]:
    """Serialize a list of product docs into ProductCard format."""
    return [_serialize_card(doc) for doc in docs]


def _serialize_list(docs: list[dict]) -> list[dict]:
    """Serialize a list of documents (e.g. banners) — just ObjectId conversion."""
    return [_serialize_doc(doc) for doc in docs]


class LandingService:

    # ── Landing Page (Public) ─────────────────────────────────────────────

    @staticmethod
    async def get_landing_page() -> dict:
        """
        Returns all landing page sections in one response.
        Uses Redis caching with 5-min TTL. On cache miss, runs 6 queries in parallel.
        """
        # 1. Check Redis cache
        try:
            if redis_client:
                cached = await redis_client.get(LANDING_CACHE_KEY)
                if cached:
                    logger.info("Landing page served from Redis cache")
                    return json.loads(cached)
        except Exception as e:
            logger.warning(f"Redis cache read failed (non-fatal): {e}")

        # 2. Cache miss — run ALL queries in parallel
        products_col = products_collection()
        banners_col = banners_collection()

        results = await asyncio.gather(
            fetch_active_banners(banners_col),
            fetch_categories_with_subcategories(products_col),
            fetch_flash_deals(products_col),
            fetch_top_products(products_col),
            fetch_new_arrivals(products_col),
            fetch_featured_products(products_col),
        )

        # 3. Build response
        response = {
            "banners": _serialize_list(results[0]),
            "categories": results[1],          # Already projected by aggregation
            "flash_deals": _serialize_cards(results[2]),
            "top_products": _serialize_cards(results[3]),
            "new_arrivals": _serialize_cards(results[4]),
            "featured": _serialize_cards(results[5]),
        }

        # 4. Cache in Redis (non-blocking — don't let cache failures crash landing)
        try:
            if redis_client:
                await redis_client.setex(
                    LANDING_CACHE_KEY,
                    LANDING_CACHE_TTL,
                    json.dumps(response, default=str)
                )
                logger.info("Landing page cached in Redis")
        except Exception as e:
            logger.warning(f"Redis cache write failed (non-fatal): {e}")

        return response

    # ── Cache Invalidation ────────────────────────────────────────────────

    @staticmethod
    async def _invalidate_landing_cache():
        """Delete the landing page cache so the next request rebuilds it."""
        try:
            if redis_client:
                await redis_client.delete(LANDING_CACHE_KEY)
                logger.info("Landing page cache invalidated")
        except Exception as e:
            logger.warning(f"Redis cache invalidation failed (non-fatal): {e}")

    # ── Banner CRUD (Admin) ───────────────────────────────────────────────

    @staticmethod
    async def create_banner(payload) -> dict:
        """Create a new banner and invalidate the landing cache."""
        banner_data = payload.model_dump()
        banner_data["created_at"] = utc_now()
        banner_data["updated_at"] = utc_now()

        result = await insert_banner(banners_collection(), banner_data)
        await LandingService._invalidate_landing_cache()

        return _serialize_doc(result)

    @staticmethod
    async def get_all_banners() -> dict:
        """Get all banners (active + inactive) for admin management."""
        banners = await fetch_all_banners(banners_collection())
        return {"banners": _serialize_list(banners), "total": len(banners)}

    @staticmethod
    async def update_banner(banner_id: str, payload) -> dict:
        """Update a banner and invalidate the landing cache."""
        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_data["updated_at"] = utc_now()
        result = await update_banner_by_id(banners_collection(), banner_id, update_data)
        await LandingService._invalidate_landing_cache()

        return _serialize_doc(result)

    @staticmethod
    async def delete_banner(banner_id: str) -> dict:
        """Delete a banner and invalidate the landing cache."""
        await delete_banner_by_id(banners_collection(), banner_id)
        await LandingService._invalidate_landing_cache()

        return {"message": "Banner deleted successfully"}
