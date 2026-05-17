import logging
from bson import ObjectId
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from app.core.time_utils import utc_now

logger = logging.getLogger("uvicorn.error")

async def insert_seller_product(collection, product_data: dict) -> dict:
    try:
        result = await collection.insert_one(product_data)
        product_data["_id"] = result.inserted_id
        return product_data
    except PyMongoError as e:
        logger.error(f"DB Error inserting product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_products(collection, seller_id: str, filters: dict = None, skip: int = 0, limit: int = 10):
    try:
        query = {"seller_id": seller_id, "is_deleted": False}
        if filters:
            query.update(filters)
        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)
        return items, total
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller products: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_product_by_id(collection, product_id: str, seller_id: str):
    try:
        product = await collection.find_one({"_id": ObjectId(product_id), "seller_id": seller_id, "is_deleted": False})
        return product
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_product(collection, product_id: str, seller_id: str, update_data: dict):
    try:
        update_data["updated_at"] = utc_now()
        result = await collection.update_one(
            {"_id": ObjectId(product_id), "seller_id": seller_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def soft_delete_seller_product(collection, product_id: str, seller_id: str):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(product_id), "seller_id": seller_id},
            {"$set": {"is_deleted": True, "updated_at": utc_now()}}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error deleting seller product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_product_by_slug(collection, seller_id: str, slug: str):
    try:
        return await collection.find_one({"seller_id": seller_id, "slug": slug})
    except PyMongoError as e:
        logger.error(f"DB Error fetching product by slug: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_orders(collection, seller_id: str, skip: int = 0, limit: int = 10, status: str = None, year: int = None, month: int = None):
    try:
        base_match = {"items.seller_id": ObjectId(seller_id)}

        # Date filter on order created_at
        if year and month:
            start = datetime(year, month, 1, tzinfo=timezone.utc)
            if month == 12:
                end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
            else:
                end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
            base_match["created_at"] = {"$gte": start, "$lt": end}
        elif year:
            start = datetime(year, 1, 1, tzinfo=timezone.utc)
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
            base_match["created_at"] = {"$gte": start, "$lt": end}

        pipeline = [
            {"$match": base_match},
            {"$addFields": {
                "items": {
                    "$filter": {
                        "input": "$items",
                        "as": "item",
                        "cond": {"$eq": ["$$item.seller_id", ObjectId(seller_id)]}
                    }
                }
            }},
        ]

        # Status filter on item_status (post seller-item filter)
        if status:
            pipeline.append({
                "$match": {"items.item_status": status}
            })

        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})

        pipeline.extend([
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ])

        cursor = collection.aggregate(pipeline)
        items = await cursor.to_list(length=limit)
        
        count_cursor = collection.aggregate(count_pipeline)
        count_result = await count_cursor.to_list(length=1)
        total = count_result[0]["total"] if count_result else 0
        
        return items, total
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller orders: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_full_order_by_id(collection, order_id: str):
    """Fetch the complete order document with ALL items (across all sellers)."""
    try:
        return await collection.find_one({"_id": ObjectId(order_id)})
    except PyMongoError as e:
        logger.error(f"DB Error fetching full order by id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_order_by_id(collection, order_id: str, seller_id: str):
    try:
        pipeline = [
            {"$match": {"_id": ObjectId(order_id), "items.seller_id": ObjectId(seller_id)}},
            {"$addFields": {
                "items": {
                    "$filter": {
                        "input": "$items",
                        "as": "item",
                        "cond": {"$eq": ["$$item.seller_id", ObjectId(seller_id)]}
                    }
                }
            }}
        ]
        cursor = collection.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        return result[0] if result else None
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller order by id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_order_item_status(collection, order_id: str, seller_id: str, new_status: str):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "items.$[elem].item_status": new_status,
                    "updated_at": utc_now()
                }
            },
            array_filters=[{"elem.seller_id": ObjectId(seller_id)}]
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller order status: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_order_item_status_by_product(collection, order_id: str, seller_id: str, product_id: str, new_status: str) -> bool:
    """Update the status of a single item identified by both seller_id and product_id."""
    try:
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "items.$[elem].item_status": new_status,
                    "updated_at": utc_now()
                }
            },
            array_filters=[{"elem.seller_id": ObjectId(seller_id), "elem.product_id": ObjectId(product_id)}]
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating order item status by product: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_order_status(collection, order_id: str, new_status: str):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "order_status": new_status,
                    "updated_at": utc_now()
                }
            },
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller order status: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_seller_dashboard_stats(product_collection, order_collection, sellers_collection, seller_id: str):
    try:
        now = utc_now()

        # ── 1. Product Stats ──────────────────────────────────────────────────
        products = await product_collection.find(
            {"seller_id": seller_id, "is_deleted": False}
        ).to_list(length=None)

        total_products      = len(products)
        active_products     = sum(1 for p in products if p.get("is_active") and p.get("is_approved"))
        pending_approval    = sum(1 for p in products if not p.get("is_approved") and not p.get("is_deleted"))
        out_of_stock        = sum(1 for p in products if p.get("stock", 0) == 0)
        low_stock           = sum(1 for p in products if 0 < p.get("stock", 0) < 10)
        hidden              = sum(1 for p in products if p.get("is_approved") and not p.get("is_active"))

        # Build product_id → product map for top products lookup
        product_map = {str(p["_id"]): p for p in products}

        # ── 2. Aggregation Pipeline for Revenue and Stats ─────────────────────
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_week  = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=now.weekday())
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        thirty_days_ago = start_of_today - timedelta(days=30)

        stats_pipeline = [
            {"$match": {"items.seller_id": ObjectId(seller_id)}},
            {"$unwind": "$items"},
            {"$match": {"items.seller_id": ObjectId(seller_id)}}, # Ensure unwound items are still seller's
            {"$facet": {
                "order_counts": [
                    {"$group": {"_id": {"order_id": "$_id", "status": "$items.item_status"}}},
                    {"$group": {"_id": "$_id.status", "count": {"$sum": 1}}}
                ],
                "unique_order_count": [
                    {"$group": {"_id": "$_id"}},
                    {"$count": "total"}
                ],
                "revenue": [
                    {"$match": {"items.item_status": {"$ne": "cancelled"}}},
                    {"$project": {
                        "revenue": {"$multiply": ["$items.price", "$items.quantity"]},
                        "created_at": "$created_at"
                    }},
                    {"$group": {
                        "_id": None,
                        "all_time": {"$sum": "$revenue"},
                        "this_month": {
                            "$sum": {"$cond": [{"$gte": ["$created_at", start_of_month]}, "$revenue", 0]}
                        },
                        "this_week": {
                            "$sum": {"$cond": [{"$gte": ["$created_at", start_of_week]}, "$revenue", 0]}
                        },
                        "today": {
                            "$sum": {"$cond": [{"$gte": ["$created_at", start_of_today]}, "$revenue", 0]}
                        }
                    }}
                ],
                "weekly_revenue": [
                    {"$match": {"items.item_status": {"$ne": "cancelled"}}},
                    {"$match": {"created_at": {"$gte": start_of_today - timedelta(days=6)}}},
                    {"$group": {
                        "_id": {
                            "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                        },
                        "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
                    }}
                ],
                "top_products": [
                    {"$match": {"items.item_status": {"$ne": "cancelled"}}},
                    {"$match": {"created_at": {"$gte": thirty_days_ago}}},
                    {"$group": {
                        "_id": "$items.product_id",
                        "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}},
                        "units_sold": {"$sum": "$items.quantity"},
                        "name": {"$first": "$items.name"},
                        "image": {"$first": "$items.image"}
                    }},
                    {"$sort": {"revenue": -1}},
                    {"$limit": 5}
                ]
            }}
        ]

        result = await order_collection.aggregate(stats_pipeline).to_list(length=1)
        data = result[0] if result else {}

        # ── 3. Extract Order Status Breakdown ─────────────────────────────────
        order_counts = {item["_id"]: item["count"] for item in data.get("order_counts", [])}
        total_orders_count = data.get("unique_order_count", [{}])[0].get("total", 0) if data.get("unique_order_count") else 0

        # ── 4. Extract Revenue Calculations ───────────────────────────────────
        rev_data = data.get("revenue", [{}])[0] if data.get("revenue") else {}
        all_time_rev = rev_data.get("all_time", 0.0)
        month_rev    = rev_data.get("this_month", 0.0)
        week_rev     = rev_data.get("this_week", 0.0)
        today_rev    = rev_data.get("today", 0.0)

        # ── 5. Extract Weekly Revenue (last 7 calendar days) ──────────────────
        weekly_raw = {item["_id"]: item["revenue"] for item in data.get("weekly_revenue", [])}
        days_abbr  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_revenue = []
        for i in range(6, -1, -1):
            day_date = start_of_today - timedelta(days=i)
            day_str = day_date.strftime("%Y-%m-%d")
            weekly_revenue.append({
                "day": days_abbr[day_date.weekday()],
                "revenue": round(weekly_raw.get(day_str, 0.0), 2),
                "is_today": i == 0
            })

        # ── 6. Extract Top 5 Products (last 30 days by revenue) ───────────────
        top_products = []
        for p in data.get("top_products", []):
            pid = str(p["_id"])
            prod = product_map.get(pid, {})
            top_products.append({
                "product_id": pid,
                "name": p.get("name") or prod.get("name", "Unknown"),
                "image": p.get("image") or (prod.get("image_urls") or [""])[0],
                "units_sold": p.get("units_sold", 0),
                "revenue": round(p.get("revenue", 0.0), 2),
                "avg_rating": float(prod.get("avg_rating", 0))
            })

        # ── 7. Recent 5 Orders ────────────────────────────────────────────────
        recent_pipeline = [
            {"$match": {"items.seller_id": ObjectId(seller_id)}},
            {"$sort": {"created_at": -1}},
            {"$limit": 5},
            {"$project": {
                "_id": 1,
                "created_at": 1,
                "order_status": 1,
                "shipping_address": 1,
                "items": {
                    "$filter": {
                        "input": "$items",
                        "as": "item",
                        "cond": {"$eq": ["$$item.seller_id", ObjectId(seller_id)]}
                    }
                }
            }}
        ]
        recent_orders_raw = await order_collection.aggregate(recent_pipeline).to_list(length=5)
        recent_orders_list = []
        for row in recent_orders_raw:
            items = row.get("items", [])
            seller_total = sum(float(i.get("price", 0)) * int(i.get("quantity", 1)) for i in items)
            buyer_name = row.get("shipping_address", {}).get("full_name", "")
            first_name = buyer_name.split()[0] if buyer_name else "—"
            
            recent_orders_list.append({
                "order_id": str(row["_id"]),
                "created_at": row.get("created_at"),
                "item_count": len(items),
                "seller_total": round(seller_total, 2),
                "order_status": row.get("order_status", ""),
                "buyer_first_name": first_name,
            })

        # ── 8. Store Rating ───────────────────────────────────────────────────
        total_reviews = sum(p.get("review_count", 0) for p in products if p.get("is_active") and p.get("is_approved"))
        if total_reviews > 0:
            total_score = sum(float(p.get("avg_rating", 0)) * p.get("review_count", 0) for p in products if p.get("is_active") and p.get("is_approved"))
            avg_rating = round(total_score / total_reviews, 1)
        else:
            avg_rating = 0.0

        # ── Final Response ────────────────────────────────────────────────────
        return {
            "products": {
                "total":            total_products,
                "active":           active_products,
                "pending_approval": pending_approval,
                "out_of_stock":     out_of_stock,
                "low_stock":        low_stock,
                "hidden":           hidden,
            },
            "orders": {
                "total":     total_orders_count,
                "pending":   order_counts.get("pending", 0),
                "confirmed": order_counts.get("confirmed", 0),
                "shipped":   order_counts.get("shipped", 0),
                "delivered": order_counts.get("delivered", 0),
                "cancelled": order_counts.get("cancelled", 0),
            },
            "revenue": {
                "all_time":   round(all_time_rev, 2),
                "this_month": round(month_rev, 2),
                "this_week":  round(week_rev, 2),
                "today":      round(today_rev, 2),
            },
            "weekly_revenue": weekly_revenue,
            "top_products":   top_products,
            "recent_orders":  recent_orders_list,
            "store": {
                "avg_rating":    avg_rating,
                "total_reviews": total_reviews,
            },
        }
    except PyMongoError as e:
        logger.error(f"DB Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        logger.error(f"Unexpected error in dashboard stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

# --- Restored Admin/Profile Helpers ---

async def get_seller_by_user_id(collection, user_id: str):
    try:
        return await collection.find_one({"user_id": user_id})
    except PyMongoError as e:
        logger.error(f"DB Error fetching seller by user id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def insert_seller(collection, data: dict):
    try:
        result = await collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data
    except PyMongoError as e:
        logger.error(f"DB Error inserting seller: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_user_id(collection, user_id: str, data: dict):
    try:
        result = await collection.update_one(
            {"user_id": user_id},
            {"$set": data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller by user id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def update_seller_by_object_id(collection, obj_id, data: dict):
    try:
        result = await collection.update_one(
            {"_id": ObjectId(obj_id)},
            {"$set": data}
        )
        return result.modified_count > 0
    except PyMongoError as e:
        logger.error(f"DB Error updating seller by obj id: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def get_pending_sellers(collection, limit: int, skip: int):
    try:
        cursor = collection.find({"application_status": "pending"}).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        for item in items:
            item["_id"] = str(item["_id"])
        return items
    except PyMongoError as e:
        logger.error(f"DB Error fetching pending sellers: {e}")
        raise HTTPException(status_code=500, detail="Database error")
