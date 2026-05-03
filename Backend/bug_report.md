# 🐛 Anozon Backend — Bug & Logic Error Report

> **Scope:** Full codebase review of `app/` directory  
> **Date:** 2026-05-03  
> **Total Issues Found:** 18

---

## 🔴 CRITICAL — Crash / Data Corruption (4)

### C1. `now_ist()` is undefined — Signup crashes every time

**File:** [auth_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/auth_service.py#L43)

Line 43 calls `now_ist()` but this function is never imported or defined anywhere in the codebase. Every signup call will crash with `NameError`.

```diff
# auth_service.py — add import at top
+from app.core.time_utils import utc_now

# Line 43 — fix the call
-            "created_at": now_ist()
+            "created_at": utc_now()
```

---

### C2. `delete_user()` never matches — uses raw string instead of ObjectId

**File:** [auth_helpers.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/auth_helpers.py#L54-L60)

`delete_user` queries `{"_id": user_id}` with a raw string, but MongoDB stores `_id` as `ObjectId`. This will silently match zero documents.

```diff
 async def delete_user(collection, user_id: str):
     try:
-        result = await collection.delete_one({"_id": user_id})
+        result = await collection.delete_one({"_id": ObjectId(user_id)})
         return result
```

---

### C3. Buy-now rollback restores stock even when decrement itself failed

**File:** [order_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/order_service.py#L242-L250)

If `decrement_product_stock` raises an `HTTPException` (insufficient stock), the `except` block catches it and **still calls `increment_product_stock`** — restoring stock that was never deducted. This corrupts inventory.

```diff
         try:
             success = await decrement_product_stock(products_collection(), product_id, quantity)
             if not success:
-                raise HTTPException(status_code=400, detail="Insufficient stock")
-        except Exception as e:
-            await increment_product_stock(products_collection(), product_id, quantity)
+                # Cancel order but do NOT restore stock (it was never deducted)
+                await update_order_status_db(orders_collection(), order_id, user_id, OrderStatus.cancelled.value)
+                raise HTTPException(status_code=400, detail="Insufficient stock")
+        except HTTPException:
+            raise  # Re-raise without double-restoring
+        except Exception as e:
+            # Only restore if decrement actually succeeded before a later failure
+            await increment_product_stock(products_collection(), product_id, quantity)
             await update_order_status_db(orders_collection(), order_id, user_id, OrderStatus.cancelled.value)
```

---

### C4. Redis `connect_redis()` never actually pings — silent failure

**File:** [redis.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/db/redis.py#L10-L17)

`redis.from_url()` is lazy — it doesn't connect until the first command. If Redis is down, the app starts "successfully" but every OTP/rate-limit operation crashes later. Also, `HTTPException` should not be raised during startup (no request context).

```diff
 async def connect_redis():
     global redis_client
     try:
         redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
+        await redis_client.ping()  # Force an actual connection test
         logger.info("Redis connected successfully")
     except Exception as e:
         logger.error(f"Redis connection error: {e}")
-        raise HTTPException(status_code=500, detail="Failed to connect to Redis")
+        raise RuntimeError(f"Failed to connect to Redis: {e}")
```

---

## 🟠 HIGH — Incorrect Behavior (7)

### H1. Seller `user_id` stored as `str` but queried as `ObjectId` (and vice versa)

**Files:** Multiple seller helpers use inconsistent types.

- [admin_helpers.py L11](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/admin_helpers.py#L11): `find_one({"user_id": user_id})` — queries with **string**
- [seller_helpers.py L240](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/seller_helpers.py#L240): `find_one({"user_id": user_id})` — also **string**
- [product_service.py L96](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/product_service.py#L96): `find_one({"user_id": search_id})` — converts to **ObjectId**
- `SellerProfile` model stores `user_id` as a string from `apply_for_seller`

**Impact:** If `user_id` is stored as string in Sellers collection, then the `ObjectId(seller_id)` query in `product_service.py` L96 will never match (and vice versa). Product detail page will never show seller info.

**Fix:** Standardize. Since `apply_for_seller` stores `user_id` as a plain string, the query in `product_service.py` should also use a string:

```diff
# product_service.py L95-96
-               search_id = ObjectId(seller_id) if isinstance(seller_id, str) else seller_id
-               seller = await sellers_collection().find_one({"user_id": search_id})
+               seller = await sellers_collection().find_one({"user_id": str(seller_id)})
```

---

### H2. `seller_details` is a list but should be a single object

**File:** [product_model.py L78](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/models/product_model.py#L78)

`seller_details` is typed as `list[SellerMinimalResponse]` and populated as a single-item list. A product only has one seller. Should be `Optional[SellerMinimalResponse]`.

```diff
# product_model.py
-    seller_details: list["SellerMinimalResponse"] = []
+    seller_details: Optional["SellerMinimalResponse"] = None

# product_service.py — update serialization
-                    serialized_product["seller_details"] = [{...}]
+                    serialized_product["seller_details"] = {...}
```

---

### H3. Review `order_status` check is too strict — per-item check needed

**File:** [review_service.py L33](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/review_service.py#L33)

The review service checks `order.order_status == OrderStatus.delivered`, but with per-item statuses, the order-level status could be `partially_delivered` while the specific item IS delivered. Users of partially-delivered orders can never write reviews.

```diff
-        if order.get("order_status") != OrderStatus.delivered:
-            raise HTTPException(status_code=400, detail="You can only review products from delivered orders")
+        # Check item-level status, not order-level
+        target_item = next(
+            (item for item in order.get("items", []) if str(item.get("product_id")) == product_id),
+            None
+        )
+        if not target_item:
+            raise HTTPException(status_code=400, detail="This product was not part of this order")
+        if target_item.get("item_status") != ItemStatus.delivered.value:
+            raise HTTPException(status_code=400, detail="You can only review delivered items")
```

---

### H4. Cart image field mismatch: `image_urls` vs `images`

**File:** [user_service.py L205](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/user_service.py#L205)

The product model defines `image_urls`, but `get_calculated_cart` reads `product.get("images")`. This will always return `None` — cart items will never show images.

```diff
-                    "image": product.get("images", [""])[0] if product.get("images") else "",
+                    "image": product.get("image_urls", [""])[0] if product.get("image_urls") else "",
```

Same fix needed on [line 237](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/user_service.py#L237).

And in buy-now ([order_service.py L199](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/order_service.py#L199)):
```diff
-            "image": (product.get("images") or [""])[0],
+            "image": (product.get("image_urls") or [""])[0],
```

---

### H5. Seller dashboard pipeline filters on `items.status` instead of `items.item_status`

**File:** [seller_helpers.py L195](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/seller_helpers.py#L195)

The field is `item_status` (per `OrderItem` model), not `status`. This `$nin` filter matches nothing, so cancelled items are **included** in revenue.

```diff
-            {"$match": {"items.status": {"$nin": ["cancelled"]}}},
+            {"$match": {"items.item_status": {"$nin": ["cancelled"]}}},
```

---

### H6. Ollama AI endpoint uses synchronous `requests` — blocks the event loop

**File:** [ollama.py L18](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/ai/ollama.py#L18)

Using `requests.post()` in an async FastAPI app blocks the entire event loop. All other requests stall while waiting for the AI response.

```diff
+import httpx
-import requests

 @router.get("/ollama/ai/chat")
-def ask_ollama_ai(message: str = Query(...)):
+async def ask_ollama_ai(message: str = Query(...)):
     try:
-        response = requests.post(
-            f"{OLLAMA_URL}/chat", ...
-        )
+        async with httpx.AsyncClient(timeout=60) as client:
+            response = await client.post(
+                f"{OLLAMA_URL}/chat", ...
+            )
```

---

### H7. `close_redis()` raises `HTTPException` during shutdown — no request context

**File:** [redis.py L19-25](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/db/redis.py#L19-L25)

Raising `HTTPException` during app shutdown causes an unhandled error since there's no HTTP request being processed.

```diff
 async def close_redis():
     try:
-        await redis_client.close()
+        if redis_client:
+            await redis_client.close()
         logger.info("Redis connection closed")
     except Exception as e:
         logger.error(f"Redis connection close error: {e}")
-        raise HTTPException(status_code=500, detail="Failed to close Redis connection")
+        # Don't raise during shutdown — just log
```

---

## 🟡 MEDIUM — Subtle Logic Flaws (5)

### M1. `datetime.utcnow()` used everywhere despite being deprecated

**Files:** Nearly every service and helper file.

`datetime.utcnow()` is deprecated since Python 3.12 (you even have `utc_now()` in `time_utils.py`). It returns a naive datetime, while your JWT tokens use timezone-aware times. This can cause subtle comparison bugs.

**Fix:** Replace all `datetime.utcnow()` calls with `utc_now()` from `app.core.time_utils`. There are ~25 occurrences across:
- `orders_helpers.py` (L13, L14, L48)
- `cart_helpers.py` (L14, L44, L50, L62, L74, L86, L102, L105, L112)
- `seller_helpers.py` (L41, L55, L140, L158, L175)
- `profiles_helpers.py` (L18, L47, L62, L72, L89)
- `audit_service.py` (L66)
- `admin_service.py` (L72, L154, etc.)
- `seller_service.py` (L34, L63, L121, L278)
- `review_service.py` (L62)
- Model defaults in `product_model.py`, `orders_model.py`, `seller_model.py`, `cart_model.py`, `audit_model.py`, `profiles_model.py`

---

### M2. `compute_order_status` compares enum values against enum members

**File:** [order_utils.py L14-17](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/utils/order_utils.py#L14-L17)

`item.get("item_status")` returns a **string** (e.g. `"cancelled"`) from MongoDB, but it's compared against `ItemStatus.cancelled` (an **enum member**). In Python, `"cancelled" != ItemStatus.cancelled` is `False` since `ItemStatus` is `str, Enum` — so this works *by coincidence*. However, the `VAILD_TRANSISTION` dict on L47-52 uses enum members as **keys**, and `current_status` from `target_item.get("item_status")` is a **string**. The `.get()` lookup will always return `None` → `allowed_next` is always `None` → every transition is rejected.

```diff
# seller_service.py L236
-        current_status = target_item.get("item_status", ItemStatus.pending)
+        current_status = ItemStatus(target_item.get("item_status", "pending"))
```

---

### M3. Order cancellation uses `ObjectId` comparison on potentially string `product_id`

**File:** [order_service.py L335-353](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/order_service.py#L335-L353)

`items_to_cancel` items come from MongoDB where `product_id` is stored as `ObjectId`. But `product_ids_to_cancel` converts them with `ObjectId(item["product_id"])`. If the value is already an ObjectId, this works. But on L353, it compares `ObjectId(item["product_id"])` against the list — if some items have string IDs, this silently skips stock restoration.

---

### M4. `product_likes` can go negative

**File:** [product_helpers.py L137-147](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/product_helpers.py#L137-L147)

The unlike operation does `$inc: {"product_likes": -1}` without checking if `product_likes > 0`. If there's a race condition or data inconsistency, likes can go below zero.

```diff
# For the unlike decrement:
-                await collection.update_one(
-                    {"_id": ObjectId(product_id)},
-                    {"$inc": {"product_likes": -1}}
+                await collection.update_one(
+                    {"_id": ObjectId(product_id), "product_likes": {"$gt": 0}},
+                    {"$inc": {"product_likes": -1}}
                 )
```

---

### M5. `fetch_pending_products` returns items that have already been rejected

**File:** [admin_helpers.py L54-60](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/admin_helpers.py#L54-L60)

The query `{"is_approved": False, "is_deleted": False}` will return products that were explicitly **rejected** (they also have `is_approved: False`). This means rejected products keep reappearing in the admin's pending queue.

```diff
-        cursor = collection.find({"is_approved": False, "is_deleted": False})
+        cursor = collection.find({
+            "is_approved": False,
+            "is_deleted": False,
+            "rejection_reason": {"$exists": False}  # Exclude rejected
+        })
```

Or better: add an explicit `approval_status` field (pending/approved/rejected) instead of relying on boolean `is_approved`.

---

## 🔵 LOW — Code Quality / Minor (2)

### L1. `VAILD_TRANSISTION` typo

**File:** [order_utils.py L47](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/utils/order_utils.py#L47)

```diff
-VAILD_TRANSISTION: dict[str, list[str]] = {
+VALID_TRANSITION: dict[str, list[str]] = {
```

Also update the import in [seller_service.py L17](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/seller_service.py#L17).

---

### L2. Unused import in `deps/roles.py`

**File:** [roles.py L4](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/deps/roles.py#L4)

`get_users_collection` is imported but never used.

```diff
-from app.db.mongodb import get_users_collection
```

---

## Summary Table

| ID | Severity | File | Issue |
|----|----------|------|-------|
| C1 | 🔴 Critical | `auth_service.py` | `now_ist()` undefined — signup crashes |
| C2 | 🔴 Critical | `auth_helpers.py` | `delete_user` uses string instead of ObjectId |
| C3 | 🔴 Critical | `order_service.py` | Buy-now rollback double-restores stock |
| C4 | 🔴 Critical | `redis.py` | No ping test — silent connection failure |
| H1 | 🟠 High | Multiple | Seller `user_id` type mismatch (str vs ObjectId) |
| H2 | 🟠 High | `product_model.py` | `seller_details` should be object, not list |
| H3 | 🟠 High | `review_service.py` | Review gate checks order-level, not item-level status |
| H4 | 🟠 High | `user_service.py` | `images` vs `image_urls` field mismatch |
| H5 | 🟠 High | `seller_helpers.py` | Dashboard uses wrong field name `status` |
| H6 | 🟠 High | `ollama.py` | Sync `requests` blocks async event loop |
| H7 | 🟠 High | `redis.py` | HTTPException during shutdown |
| M1 | 🟡 Medium | ~15 files | Deprecated `datetime.utcnow()` everywhere |
| M2 | 🟡 Medium | `order_utils.py` | Enum vs string comparison in transitions |
| M3 | 🟡 Medium | `order_service.py` | ObjectId/string type mismatch in cancellation |
| M4 | 🟡 Medium | `product_helpers.py` | `product_likes` can go negative |
| M5 | 🟡 Medium | `admin_helpers.py` | Rejected products shown as pending |
| L1 | 🔵 Low | `order_utils.py` | `VAILD_TRANSISTION` typo |
| L2 | 🔵 Low | `roles.py` | Unused import |
