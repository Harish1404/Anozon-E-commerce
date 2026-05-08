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

async def get_seller_orders(collection, seller_id: str, skip: int = 0, limit: int = 10):
    try:
        pipeline = [
            {"$match": {"items.seller_id": ObjectId(seller_id)}},
            {"$addFields": {
                "items": {
                    "$filter": {
                        "input": "$items",
                        "as": "item",
                        "cond": {"$eq": ["$$item.seller_id", ObjectId(seller_id)]}
                    }
                }
            }},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        count_pipeline = [
            {"$match": {"items.seller_id": ObjectId(seller_id)}},
            {"$count": "total"}
        ]
        
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

        # ── 2. All Seller Order Items (non-cancelled) ─────────────────────────
        items_pipeline = [
            {"$match": {"items.seller_id": ObjectId(seller_id)}},
            {"$unwind": "$items"},
            {"$match": {
                "items.seller_id": ObjectId(seller_id),
                "items.item_status": {"$nin": ["cancelled"]}
            }},
            {"$project": {
                "_id": 1,
                "created_at": 1,
                "order_status": 1,
                "items": 1,
                "shipping_address": 1,
            }},
        ]
        all_items = await order_collection.aggregate(items_pipeline).to_list(length=None)

        # ── 3. Order Status Breakdown ─────────────────────────────────────────
        # Count unique orders per status
        order_status_map: dict[str, set] = {
            "confirmed": set(), "shipped": set(), "delivered": set(), "cancelled": set()
        }
        all_order_ids: set = set()
        for row in all_items:
            oid = str(row["_id"])
            all_order_ids.add(oid)
            status = row["items"].get("item_status", "")
            if status in order_status_map:
                order_status_map[status].add(oid)

        total_orders_count = len(all_order_ids)

        # ── 4. Revenue Calculations ───────────────────────────────────────────
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # ISO week starts Monday
        start_of_week  = now.replace(
            hour=0, minute=0, second=0, microsecond=0
        ) - timedelta(days=now.weekday())
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

        all_time_rev   = 0.0
        month_rev      = 0.0
        week_rev       = 0.0
        today_rev      = 0.0

        for row in all_items:
            item      = row["items"]
            revenue   = float(item.get("price", 0)) * int(item.get("quantity", 1))
            created   = row.get("created_at")
            if created is None:
                continue
            # Normalize to UTC-aware for comparison
            if hasattr(created, "tzinfo") and created.tzinfo is not None:
                created = created.astimezone(timezone.utc)
            else:
                created = created.replace(tzinfo=timezone.utc)

            all_time_rev += revenue
            if created >= start_of_month:
                month_rev += revenue
            if created >= start_of_week:
                week_rev += revenue
            if created >= start_of_today:
                today_rev += revenue

        # ── 5. Weekly Revenue (last 7 calendar days) ──────────────────────────
        days_abbr  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        daily_rev  = {}
        for i in range(6, -1, -1):
            day_start = (start_of_today - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end   = day_start + timedelta(days=1)
            day_label = days_abbr[day_start.weekday()]
            daily_rev[day_start] = {"day": day_label, "revenue": 0.0, "is_today": i == 0}

        for row in all_items:
            item    = row["items"]
            revenue = float(item.get("price", 0)) * int(item.get("quantity", 1))
            created = row.get("created_at")
            if created is None:
                continue
            if hasattr(created, "tzinfo") and created.tzinfo is not None:
                created = created.astimezone(timezone.utc)
            else:
                created = created.replace(tzinfo=timezone.utc)
            day_bucket = created.replace(hour=0, minute=0, second=0, microsecond=0)
            if day_bucket in daily_rev:
                daily_rev[day_bucket]["revenue"] += revenue

        weekly_revenue = list(daily_rev.values())

        # ── 6. Top 5 Products (last 30 days by revenue) ───────────────────────
        thirty_days_ago = start_of_today - timedelta(days=30)
        product_revenue: dict[str, dict] = {}

        for row in all_items:
            item    = row["items"]
            created = row.get("created_at")
            if created is None:
                continue
            if hasattr(created, "tzinfo") and created.tzinfo is not None:
                created = created.astimezone(timezone.utc)
            else:
                created = created.replace(tzinfo=timezone.utc)
            if created < thirty_days_ago:
                continue
            pid     = str(item.get("product_id", ""))
            revenue = float(item.get("price", 0)) * int(item.get("quantity", 1))
            qty     = int(item.get("quantity", 1))
            if pid not in product_revenue:
                prod = product_map.get(pid, {})
                product_revenue[pid] = {
                    "product_id": pid,
                    "name":       item.get("name", prod.get("name", "Unknown")),
                    "image":      (item.get("image") or (prod.get("image_urls") or [""])[0]),
                    "units_sold": 0,
                    "revenue":    0.0,
                }
            product_revenue[pid]["units_sold"] += qty
            product_revenue[pid]["revenue"]    += revenue

        top_products = sorted(product_revenue.values(), key=lambda x: x["revenue"], reverse=True)[:5]

        # ── 7. Recent 5 Orders ────────────────────────────────────────────────
        seen_orders: set   = set()
        recent_orders_list = []

        for row in sorted(all_items, key=lambda x: x.get("created_at") or datetime.min, reverse=True):
            oid = str(row["_id"])
            if oid in seen_orders:
                continue
            seen_orders.add(oid)

            # Count seller items in this order
            seller_items_in_order = [
                r["items"] for r in all_items if str(r["_id"]) == oid
            ]
            seller_total = sum(
                float(i.get("price", 0)) * int(i.get("quantity", 1))
                for i in seller_items_in_order
            )
            buyer_name = row.get("shipping_address", {}).get("full_name", "")
            first_name = buyer_name.split()[0] if buyer_name else "—"

            recent_orders_list.append({
                "order_id":    oid,
                "created_at":  row.get("created_at"),
                "item_count":  len(seller_items_in_order),
                "seller_total": seller_total,
                "order_status": row.get("order_status", ""),
                "buyer_first_name": first_name,
            })

            if len(recent_orders_list) >= 5:
                break

        # ── 8. Store Rating ───────────────────────────────────────────────────
        seller_doc = await sellers_collection.find_one({"user_id": seller_id})
        avg_rating    = float(seller_doc.get("rating", 0) or 0) if seller_doc else 0.0
        total_reviews = int(seller_doc.get("total_reviews", 0) or 0) if seller_doc else 0

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
                "confirmed": len(order_status_map["confirmed"]),
                "shipped":   len(order_status_map["shipped"]),
                "delivered": len(order_status_map["delivered"]),
                "cancelled": len(order_status_map["cancelled"]),
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
