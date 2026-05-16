"""
Repository layer for admin data access.
Handles all MongoDB queries for the admin dashboard, user/seller/product/review management.
Follows single-responsibility: only DB queries, no business logic.
"""

import logging
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from app.core.time_utils import utc_now
from typing import Optional

logger = logging.getLogger("uvicorn.error")


# ── Seller Helpers ────────────────────────────────────────────────────────────

async def get_seller_by_user_id(collection, user_id: str):
    try:
        return await collection.find_one({"user_id": user_id})
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def insert_seller(collection, profile_data: dict):
    try:
        result = await collection.insert_one(profile_data)
        return result
    except PyMongoError as e:
        logger.error(f"DB Error inserting seller: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_user_id(collection, user_id: str, update_data: dict):
    try:
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating seller {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_object_id(collection, object_id, update_data: dict):
    try:
        result = await collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        return result
    except PyMongoError as e:
        logger.error(f"DB Error updating seller by doc ID {object_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_pending_sellers(collection, limit: int = 50, skip: int = 0):
    try:
        cursor = collection.find({"application_status": "pending"}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching pending sellers: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── Product Helpers ───────────────────────────────────────────────────────────

async def get_pending_products(collection, limit: int = 50, skip: int = 0):
    try:
        cursor = collection.find({"is_approved": False, "is_deleted": False}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching pending products: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_product_approval_status(collection, product_id: str, is_approved: bool, admin_id: str, reason: str = None):
    try:
        update_data = {
            "is_approved": is_approved,
            "reviewed_by": admin_id,
            "reviewed_at": utc_now(),
            "updated_at": utc_now()
        }
        if reason:
            update_data["rejection_reason"] = reason
            
        result = await collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating product approval {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Dashboard Stats ─────────────────────────────────────────────────────

async def get_dashboard_stats(users_col, sellers_col, products_col, orders_col):
    """Aggregate platform-wide statistics for the admin dashboard."""
    try:
        total_users = await users_col.count_documents({"role": {"$in": ["user", "seller"]}})
        total_sellers = await sellers_col.count_documents({"application_status": "approved"})
        total_products = await products_col.count_documents({"is_deleted": False})
        total_orders = await orders_col.count_documents({})
        total_admins = await users_col.count_documents({"role": {"$in": ["admin", "super_admin"]}})
        pending_sellers = await sellers_col.count_documents({"application_status": "pending"})
        pending_products = await products_col.count_documents({"is_approved": False, "is_deleted": False})
        banned_users = await users_col.count_documents({"is_banned": True})

        # Aggregate total revenue
        revenue_pipeline = [
            {"$match": {"payment_status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$summary.total"}}}
        ]
        revenue_cursor = orders_col.aggregate(revenue_pipeline)
        revenue_result = await revenue_cursor.to_list(length=1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0

        return {
            "total_users": total_users,
            "total_sellers": total_sellers,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_admins": total_admins,
            "pending_sellers": pending_sellers,
            "pending_products": pending_products,
            "banned_users": banned_users,
        }
    except PyMongoError as e:
        logger.error(f"DB Error computing dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: User Queries ─────────────────────────────────────────────────────────

async def get_all_users(
    collection,
    limit: int = 20,
    skip: int = 0,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
):
    """Fetch all users with optional search, role filter, and status filter."""
    try:
        query: dict = {}

        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"username": {"$regex": search, "$options": "i"}},
            ]

        if role:
            query["role"] = role

        if status == "banned":
            query["is_banned"] = True
        elif status == "verified":
            query["is_verified"] = True
        elif status == "unverified":
            query["is_verified"] = False

        cursor = collection.find(query, {"password": 0}).sort("created_at", -1).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)

        # Serialize ObjectIds
        for u in users:
            u["_id"] = str(u["_id"])

        return {"users": users, "total": total}
    except PyMongoError as e:
        logger.error(f"DB Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def get_user_detail(collection, user_id: str):
    """Fetch a single user's full details (excluding password)."""
    try:
        user = await collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if user:
            user["_id"] = str(user["_id"])
        return user
    except PyMongoError as e:
        logger.error(f"DB Error fetching user detail {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Seller Queries (All Statuses) ────────────────────────────────────────

async def get_all_sellers(
    collection,
    limit: int = 20,
    skip: int = 0,
    search: Optional[str] = None,
    status: Optional[str] = None,
):
    """Fetch all seller profiles with optional search and status filter."""
    try:
        query: dict = {}

        if search:
            query["$or"] = [
                {"business_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]

        if status and status != "all":
            if status == "suspended":
                query["is_suspended"] = True
            else:
                query["application_status"] = status
                if status == "approved":
                    query["is_suspended"] = {"$ne": True}

        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        sellers = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)

        for s in sellers:
            s["_id"] = str(s["_id"])

        return {"sellers": sellers, "total": total}
    except PyMongoError as e:
        logger.error(f"DB Error fetching sellers: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def get_seller_detail(collection, user_id: str):
    """Fetch a single seller profile by user_id."""
    try:
        seller = await collection.find_one({"user_id": user_id})
        if seller:
            seller["_id"] = str(seller["_id"])
        return seller
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller detail {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Product Queries (All Statuses) ───────────────────────────────────────

async def get_all_products(
    collection,
    limit: int = 20,
    skip: int = 0,
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
):
    """Fetch all products with optional search, category, and approval status filters."""
    try:
        query: dict = {"is_deleted": False}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        if category:
            query["category"] = category

        if status == "pending":
            query["is_approved"] = False
        elif status == "approved":
            query["is_approved"] = True

        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)

        for p in products:
            p["_id"] = str(p["_id"])

        return {"products": products, "total": total}
    except PyMongoError as e:
        logger.error(f"DB Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Review Queries ───────────────────────────────────────────────────────

async def get_all_reviews(
    collection,
    products_col=None,
    limit: int = 20,
    skip: int = 0,
    search: Optional[str] = None,
    product_id: Optional[str] = None,
    seller_id: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    sort_rating: Optional[str] = None,
):
    """Fetch all reviews with optional filters for admin moderation."""
    try:
        query: dict = {}

        if search:
            query["comment"] = {"$regex": search, "$options": "i"}

        if product_id:
            query["product_id"] = product_id

        # Filter by seller: find all product_ids belonging to this seller
        if seller_id and products_col is not None:
            seller_products = await products_col.find(
                {"seller_id": seller_id, "is_deleted": False},
                {"_id": 1}
            ).to_list(length=1000)
            product_ids = [str(p["_id"]) for p in seller_products]
            if product_ids:
                query["product_id"] = {"$in": product_ids}
            else:
                return {"reviews": [], "total": 0}

        if min_rating is not None or max_rating is not None:
            query["rating"] = {}
            if min_rating is not None:
                query["rating"]["$gte"] = min_rating
            if max_rating is not None:
                query["rating"]["$lte"] = max_rating

        sort_field = [("reviewed_at", -1)]
        if sort_rating == "asc":
            sort_field = [("rating", 1), ("reviewed_at", -1)]
        elif sort_rating == "desc":
            sort_field = [("rating", -1), ("reviewed_at", -1)]

        cursor = collection.find(query).sort(sort_field).skip(skip).limit(limit)
        reviews = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)

        for r in reviews:
            r["_id"] = str(r["_id"])

        return {"reviews": reviews, "total": total}
    except PyMongoError as e:
        logger.error(f"DB Error fetching reviews: {e}")
        raise HTTPException(status_code=500, detail="Database error")


async def delete_review_by_id(reviews_col, products_col, review_id: str):
    """Hard-delete a review and recalculate product rating."""
    try:
        review = await reviews_col.find_one({"_id": ObjectId(review_id)})
        if not review:
            return False

        product_id = review.get("product_id")
        rating = review.get("rating", 0)

        # Delete the review
        await reviews_col.delete_one({"_id": ObjectId(review_id)})

        # Recalculate product avg_rating
        if product_id:
            product = await products_col.find_one({"_id": ObjectId(product_id)})
            if product:
                old_avg = float(product.get("avg_rating", 0))
                old_count = int(product.get("review_count", 0))
                if old_count <= 1:
                    new_avg = 0.0
                    new_count = 0
                else:
                    new_count = old_count - 1
                    new_avg = round((old_avg * old_count - rating) / new_count, 2)

                await products_col.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$set": {"avg_rating": new_avg, "review_count": new_count}}
                )

        return True
    except PyMongoError as e:
        logger.error(f"DB Error deleting review {review_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Unban User ───────────────────────────────────────────────────────────

async def unban_user_db(collection, user_id: str):
    """Unban a user by setting is_banned to False."""
    try:
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_banned": False}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error unbanning user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Admin List (for super_admin) ─────────────────────────────────────────

async def get_all_admins(collection):
    """Fetch all users with admin or super_admin role."""
    try:
        cursor = collection.find(
            {"role": {"$in": ["admin", "super_admin"]}},
            {"password": 0}
        ).sort("created_at", -1)
        admins = await cursor.to_list(length=100)
        for a in admins:
            a["_id"] = str(a["_id"])
        return admins
    except PyMongoError as e:
        logger.error(f"DB Error fetching admins: {e}")
        raise HTTPException(status_code=500, detail="Database error")


# ── NEW: Recent Pending Sellers/Products (for dashboard widgets) ──────────────

async def get_recent_pending_sellers(collection, limit: int = 3):
    """Fetch most recent pending seller applications for dashboard widget."""
    try:
        cursor = (
            collection.find({"application_status": "pending"})
            .sort("created_at", -1)
            .limit(limit)
        )
        sellers = await cursor.to_list(length=limit)
        for s in sellers:
            s["_id"] = str(s["_id"])
        return sellers
    except PyMongoError as e:
        logger.error(f"DB Error fetching recent pending sellers: {e}")
        return []


async def get_recent_pending_products(collection, limit: int = 3):
    """Fetch most recent pending products for dashboard widget."""
    try:
        cursor = (
            collection.find({"is_approved": False, "is_deleted": False})
            .sort("created_at", -1)
            .limit(limit)
        )
        products = await cursor.to_list(length=limit)
        for p in products:
            p["_id"] = str(p["_id"])
        return products
    except PyMongoError as e:
        logger.error(f"DB Error fetching recent pending products: {e}")
        return []


# ── NEW: Seller Performance (Top & Worst) ─────────────────────────────────────

async def get_seller_performance(products_col, sellers_col, top_n: int = 5):
    """Aggregate seller performance: avg product rating and total review count."""
    try:
        pipeline = [
            {"$match": {"is_deleted": False, "is_approved": True, "review_count": {"$gt": 0}}},
            {"$group": {
                "_id": "$seller_id",
                "avg_rating": {"$avg": "$avg_rating"},
                "total_reviews": {"$sum": "$review_count"},
                "product_count": {"$sum": 1},
            }},
        ]

        results = await products_col.aggregate(pipeline).to_list(length=200)

        # Enrich with seller business_name
        seller_ids = [r["_id"] for r in results if r["_id"]]
        sellers_map = {}
        if seller_ids:
            sellers = await sellers_col.find(
                {"user_id": {"$in": seller_ids}},
                {"user_id": 1, "business_name": 1}
            ).to_list(length=200)
            sellers_map = {s["user_id"]: s.get("business_name", "Unknown") for s in sellers}

        enriched = []
        for r in results:
            enriched.append({
                "seller_id": r["_id"],
                "business_name": sellers_map.get(r["_id"], "Unknown"),
                "avg_rating": round(r["avg_rating"], 2),
                "total_reviews": r["total_reviews"],
                "product_count": r["product_count"],
            })

        # Sort
        top_sellers = sorted(enriched, key=lambda x: x["avg_rating"], reverse=True)[:top_n]
        worst_candidates = sorted(enriched, key=lambda x: x["avg_rating"])
        worst_sellers = [s for s in worst_candidates if s["avg_rating"] < 2.0][:top_n]

        return {"top_sellers": top_sellers, "worst_sellers": worst_sellers}
    except PyMongoError as e:
        logger.error(f"DB Error computing seller performance: {e}")
        return {"top_sellers": [], "worst_sellers": []}


# ── NEW: Lightweight Approved Sellers List (for filter dropdowns) ─────────────

async def get_approved_sellers_list(collection):
    """Return a lightweight list of approved sellers (id + name only)."""
    try:
        cursor = collection.find(
            {"application_status": "approved"},
            {"user_id": 1, "business_name": 1}
        ).sort("business_name", 1)
        sellers = await cursor.to_list(length=500)
        for s in sellers:
            s["_id"] = str(s["_id"])
        return sellers
    except PyMongoError as e:
        logger.error(f"DB Error fetching sellers list: {e}")
        return []
