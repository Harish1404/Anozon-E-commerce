from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger("uvicorn.error")

from app.repo.review_helpers import insert_review, get_reviews_by_product, get_review_count_by_product, check_existing_review
from app.repo.orders_helpers import get_order_by_id_db
from app.repo.profiles_helpers import get_profile_by_user_id
from app.repo.product_helpers import fetch_product_by_id
from app.db.mongodb import reviews_collection, orders_collection, profiles_collection, products_collection
from app.core.time_utils import utc_now


class ReviewService:

    @staticmethod
    async def write_review(user_id: str, review_data: dict):
        """Write a review for a product from a delivered order."""
        order_id = review_data.get("order_id")
        product_id = review_data.get("product_id")

        if not ObjectId.is_valid(order_id) or not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid order or product ID")

        # 1. Verify order exists and belongs to user
        order = await get_order_by_id_db(orders_collection(), order_id, user_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        from app.models.orders_model import ItemStatus
        # 2. Find the specific item in the order and check its delivery status
        target_item = next(
            (item for item in order.get("items", []) if str(item.get("product_id")) == product_id),
            None
        )
        if not target_item:
            raise HTTPException(status_code=400, detail="This product was not part of this order")

        # Check item-level status (not order-level) to support partial deliveries
        if target_item.get("item_status") != ItemStatus.delivered.value:
            raise HTTPException(status_code=400, detail="You can only review delivered items")

        # 4. Check for duplicate review (compound index also catches this)
        already_reviewed = await check_existing_review(reviews_collection(), product_id, user_id)
        if already_reviewed:
            raise HTTPException(status_code=409, detail="You have already reviewed this product")

        # 5. Get reviewer name from profile
        profile = await get_profile_by_user_id(profiles_collection(), user_id)
        reviewer_name = "Anonymous"
        if profile and profile.get("full_name"):
            # Use first name only for privacy
            reviewer_name = profile["full_name"].split()[0]

        # 6. Prepare review document
        review_doc = {
            "product_id": product_id,
            "user_id": user_id,
            "name": reviewer_name,
            "quality": review_data["quality"],
            "rating": review_data["rating"],
            "comment": review_data["comment"],
            "is_verified_purchase": True,
            "reviewed_at": utc_now()
        }

        # 7. Insert review
        review_id = await insert_review(reviews_collection(), review_doc)

        # 8. Update product avg_rating and review_count atomically
        product = await fetch_product_by_id(products_collection(), product_id)
        if product:
            old_avg = float(product.get("avg_rating", 0))
            old_count = int(product.get("review_count", 0))
            new_count = old_count + 1
            new_avg = round((old_avg * old_count + review_data["rating"]) / new_count, 2)

            await products_collection().update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"avg_rating": new_avg, "review_count": new_count}}
            )

        logger.info(f"Review {review_id} written for product {product_id} by user {user_id}")
        return {"message": "Review submitted successfully", "review_id": review_id}

    @staticmethod
    async def get_product_reviews(product_id: str, page: int = 1, limit: int = 20):
        """Get public reviews for a product."""

        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")

        skip = (page - 1) * limit
        reviews = await get_reviews_by_product(reviews_collection(), product_id, skip, limit)
        total = await get_review_count_by_product(reviews_collection(), product_id)

        # Format for public view — no user_id or internal fields
        public_reviews = []
        for r in reviews:
            public_reviews.append({
                "reviewer_name": r.get("name", "Anonymous"),
                "quality": r.get("quality", ""),
                "rating": r.get("rating"),
                "comment": r.get("comment"),
                "is_verified_purchase": r.get("is_verified_purchase", False),
                "reviewed_at": r.get("reviewed_at")
            })

        return {
            "product_id": product_id,
            "reviews": public_reviews,
            "total": total,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def get_seller_product_reviews(seller_id: str, product_id: str, page: int = 1, limit: int = 20):
        """Seller view of reviews on their own product."""
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")

        # Verify seller owns the product
        product = await fetch_product_by_id(products_collection(), product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if str(product.get("seller_id")) != seller_id:
            raise HTTPException(status_code=403, detail="You can only view reviews for your own products")

        skip = (page - 1) * limit
        reviews = await get_reviews_by_product(reviews_collection(), product_id, skip, limit)
        total = await get_review_count_by_product(reviews_collection(), product_id)

        seller_reviews = []
        for r in reviews:
            seller_reviews.append({
                "reviewer_name": r.get("name", "Anonymous"),
                "quality": r.get("quality", ""),
                "rating": r.get("rating"),
                "comment": r.get("comment"),
                "is_verified_purchase": r.get("is_verified_purchase", False),
                "reviewed_at": r.get("reviewed_at")
            })

        return {
            "product_id": product_id,
            "product_name": product.get("name", ""),
            "avg_rating": product.get("avg_rating", 0),
            "review_count": total,
            "reviews": seller_reviews,
            "page": page,
            "limit": limit
        }
