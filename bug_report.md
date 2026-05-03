# 🐛 Anozon E-Commerce Backend — Bug Report

> Full codebase audit completed. Bugs organized by severity.

---

## 🔴 CRITICAL (Will crash or cause data loss/security issues)

### BUG-01: Global Exception Handler Uses Wrong `Request` Import
**File:** [main.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/main.py#L3)
**Line:** 3, 27

```python
from h11 import Request  # ❌ Wrong import — h11.Request != starlette.requests.Request
```

The global exception handler on line 27 uses `Request` from `h11`, but FastAPI's `@app.exception_handler` expects `starlette.requests.Request`. This means:
- `request.method` and `request.url` on line 30 will **not work** as expected (h11 Request has a different API)
- The global error handler will itself raise an exception, so **unhandled errors will produce ugly 500s** instead of your clean JSON response

**Fix:** Change import to `from starlette.requests import Request` (or `from fastapi import Request`), and remove the unused `h11` import.

---

### BUG-02: Redis Module Uses Undefined `HTTPException`
**File:** [redis.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/db/redis.py#L16)
**Lines:** 16, 24

```python
raise HTTPException(status_code=500, detail="Failed to connect to Redis")  # ❌ HTTPException not imported
```

`HTTPException` is never imported in `redis.py`. If Redis connection fails during startup, this will raise a `NameError` instead of your intended error, **crashing the application with an unhelpful traceback**.

**Fix:** Add `from fastapi import HTTPException` at the top, or simply `raise e` since these run during lifespan (not in a request context where HTTPException makes sense).

---

### BUG-03: `reset_password` Route Missing `Response` Parameter
**File:** [auth_user.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/routes/auth_user.py#L60-L62)

```python
# Route signature:
async def reset_password(request: ResetPasswordRequest, users_col=Depends(get_users_collection)):
    return await AuthService.reset_password(request.email, request.otp_token, request.new_password, users_col)
```

But `AuthService.reset_password` expects a 5th argument `response: Response` (used to call `clear_refresh_cookie(response)`). The route **never passes a `Response` object**, so this endpoint will **crash with a TypeError** every time it's called.

**Fix:** Add `response: Response` to the route parameters and pass it through.

---

### BUG-04: Order Placement — Stock Decremented Before DB Insert (No Rollback)
**File:** [order_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/order_service.py#L81-L88)

```python
# Step 5: Decrement Stock (happens FIRST)
for item in items:
    await decrement_product_stock(...)

# Step 6: Create Order (happens SECOND — can fail!)
order_id = await create_order_in_db(...)
await clear_user_cart(...)
```

If `create_order_in_db` fails after stock is already decremented, **stock is permanently lost** with no order created. This is a classic non-atomic operation bug that causes **inventory leaks**.

**Fix:** Either use MongoDB transactions, or reverse the order (create order first, then decrement stock), or add a rollback mechanism.

---

### BUG-05: Duplicate Ollama Route — Path Collision
**File:** [product_routes.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/routes/product_routes.py#L73) and [ollama.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/ai/ollama.py#L11)

Both files define `GET /ollama/ai/chat`. The one in `product_routes.py` also:
- Uses **synchronous `requests.post()`** inside an async handler (blocks the event loop)
- Hardcodes `localhost:11434` instead of using config
- Has a **missing leading `/`** in the path: `@router.get("ollama/ai/chat")` — this won't register correctly

**Fix:** Remove the duplicate route in `product_routes.py` entirely. The `ollama.py` version is the intended one.

---

### BUG-06: CORS Middleware Order — Must Be Added BEFORE Routes
**File:** [main.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/main.py#L46-L61)

Routes are included on lines 46-52, but CORS middleware is added on lines 55-61 (after routes). In Starlette/FastAPI, **middleware order matters** — middleware added after routes may not wrap those routes properly. This can cause **CORS preflight failures** in some edge cases.

**Fix:** Move `app.add_middleware(CORSMiddleware, ...)` to **before** the `app.include_router(...)` calls.

---

### BUG-07: Insecure OTP Generation
**File:** [otp.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/utils/otp.py#L3-L4)

```python
import random  # ❌ Not cryptographically secure
def generate_otp():
    return str(random.randint(100000, 999999))
```

`random.randint` uses a Mersenne Twister PRNG that is **predictable**. An attacker who observes a few OTPs can predict future ones.

**Fix:** Use `secrets.randbelow(900000) + 100000` or `secrets.choice(range(100000, 1000000))`.

---

## 🟠 HIGH (Will cause incorrect behavior / data corruption)

### BUG-08: `auth_helpers.update_user` Queries by Raw `user_id` — Not ObjectId
**File:** [auth_helpers.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/auth_helpers.py#L47)

```python
result = await collection.update_one({"_id": user_id}, {"$set": update_data})
```

`user_id` is passed as a raw value. In the `verify_otp` flow (line 85-89 of auth_service), `user["_id"]` is an `ObjectId` from MongoDB, so it works. But in `refresh_token` (line 167), `str(user["_id"])` is passed — a **string**, not ObjectId. This means the `update_one` query **will match nothing**, silently failing to update the refresh token hash.

**Fix:** Wrap with `ObjectId(user_id)` in the helper, or ensure callers are consistent.

---

### BUG-09: `datetime.utcnow()` Used as `Field(default_factory=...)` — Deprecated
**Files:** Multiple model files (seller_model.py, product_model.py, orders_model.py, etc.)

`datetime.utcnow()` is deprecated since Python 3.12. More critically, when used directly as a default value (not `default_factory`), all instances share the same timestamp.

The models correctly use `default_factory=datetime.utcnow` in most places, but this function itself returns naive datetimes, causing timezone comparison issues.

---

### BUG-10: `init_user_orders` Creates an Orphan Placeholder Document
**File:** [orders_helpers.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/orders_helpers.py#L9-L16)

The `init_user_orders` function creates a document with `order_history: [], total_orders: 0`. But `create_order_in_db` (line 28) inserts orders as **separate documents** in the same collection. The placeholder document is:
1. **Never updated** — `total_orders` stays at 0 forever
2. **Pollutes queries** — `get_user_orders_from_db` queries by `user_id` and `status`, but this placeholder has no `status` field, so it could appear in results as a broken document
3. **Wastes storage** — serves no purpose in the current architecture

**Fix:** Remove `init_user_orders` entirely, or switch to a separate `UserOrdersSummary` collection.

---

### BUG-11: `get_calculated_cart` — Products Fetched With `only_approved=True` May Hide Cart Items
**File:** [user_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/user_service.py#L189)

```python
product = await fetch_product_by_id(products_collection(), item["product_id"])
```

`fetch_product_by_id` defaults to `only_approved=True`, which also requires `is_active=True`. If a product is deactivated after being added to cart, it **silently disappears** from the cart response with no notification to the user. The item remains in DB but isn't shown.

**Fix:** Fetch with `only_approved=False` for cart display, and add a visual indicator for unavailable items instead of hiding them.

---

### BUG-12: `allow_credentials=True` + `allow_origins=["*"]` — CORS Violation
**File:** [main.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/main.py#L55-L61)

Per the CORS specification, `Access-Control-Allow-Credentials: true` **cannot** be combined with `Access-Control-Allow-Origin: *`. Browsers will reject this combination, meaning **cookies (including your refresh token cookie) will never be sent**.

**Fix:** Replace `allow_origins=["*"]` with specific origins like `["http://localhost:3000"]`.

---

### BUG-13: Seller Dashboard Revenue Counts Cancelled Orders
**File:** [seller_helpers.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/seller_helpers.py#L150-L172)

The dashboard aggregation pipeline matches all orders with the seller's items, including **cancelled orders**. Revenue calculation doesn't filter by status, so cancelled/refunded orders inflate revenue numbers.

**Fix:** Add `{"$match": {"items.status": {"$nin": ["cancelled"]}}}` to the pipeline.

---

### BUG-14: Admin Routes Don't Check `admin_user` for None Before Use
**File:** [admin_routes.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/routes/admin_routes.py#L50-L52)

```python
# Lines 50-52 (suspend_active_seller):
admin_user = await get_users_collection().find_one({"email": email})
return await suspend_seller(target_user_id, str(admin_user["_id"]), ...)  # ❌ No None check!
```

The `suspend` and `unsuspend` routes don't check if `admin_user` is `None` before accessing `["_id"]`. If the user was deleted from DB but their token is still valid, this will **crash with TypeError**.

Other admin routes (approve, reject, ban) correctly check for `None`. These two are inconsistent.

---

## 🟡 MEDIUM (Logic errors, performance, maintainability)

### BUG-15: Ollama Route Uses Blocking `requests.post()` in Async Context
**File:** [ollama.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/ai/ollama.py#L12-L35)

The Ollama endpoint is a **sync function** (`def ask_ollama_ai`) that calls `requests.post()`. FastAPI will run this in a threadpool, but it still blocks a thread. With `product_routes.py` having a duplicate async version, there's inconsistency.

**Fix:** Use `httpx.AsyncClient` and make the handler `async def`.

---

### BUG-16: Redundant Product Fetch in `place_order`
**File:** [order_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/order_service.py#L30-L59)

Products are fetched **twice** for each item — once for validation (line 31) and again for order preparation (line 49). This is N+N unnecessary DB calls.

---

### BUG-17: `role_service.demote_user` Signature Mismatch with `seller_helpers`
**File:** [role_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/role_service.py#L6)

`role_service.py` imports `update_seller_by_user_id` from `app.repo.seller_helpers`, but `admin_service.py` imports a same-named function from `app.repo.admin_helpers`. These two have **different return types** (bool vs UpdateResult), which can cause subtle bugs if the wrong one is used.

---

### BUG-18: Wishlist Toggle — Race Condition with Product Likes
**File:** [user_routes.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/routes/user_routes.py#L89-L101)

The toggle endpoint does two separate operations: (1) toggle wishlist, (2) like/unlike product. If step 2 fails, the wishlist state and product likes counter go **out of sync**. There's no rollback.

---

### BUG-19: `product_likes` Field Settable by Client on Product Creation
**File:** [product_model.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/models/product_model.py#L22)

```python
class ProductCreate(ProductBase):
    product_likes: Optional[int] = Field(default=0)  # ❌ Client can set fake likes!
```

A seller can submit `product_likes: 99999` when creating a product. While `seller_service.py` doesn't explicitly strip this field, it also explicitly sets `data["product_likes"]`... actually, no — it **doesn't** override it for new products (only sets `avg_rating` and `review_count` on line 57-58). So the client value persists.

**Fix:** Remove `product_likes` from `ProductCreate`, or explicitly override it in the service.

---

### BUG-20: No `is_banned` Check on Login
**File:** [auth_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/auth_service.py#L120-L146)

The login flow checks for `is_verified` but **never checks `is_banned`**. A banned user can still log in and get valid tokens, defeating the purpose of the ban.

**Fix:** Add a ban check after credential verification.

---

### BUG-21: Password Reset Link Hardcodes `localhost:3000`
**File:** [email.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/utils/email.py#L111)

```python
<a href="http://localhost:3000/reset-password?token={token}">Reset Password</a>
```

This will break in any non-local environment. Should use a config variable.

---

### BUG-22: Reset Password Email Says "Expires in 1 hour" But Token TTL is 15 Minutes
**File:** [email.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/utils/email.py#L112) vs [otp_helpers.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/otp_helpers.py#L10)

Email says "1 hour", but `RESET_TOKEN_TTL = 900` (15 minutes). Users will think the link is still valid when it's already expired.

---

### BUG-23: `update_user_favorites` in `user_helpers.py` Is Imported But Never Used
**File:** [user_service.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/services/user_service.py#L7)

`update_user_favorites` is imported from `user_helpers` but never called. Favorites are handled via `cart_helpers.update_user_wishlist` instead. Dead code.

---

### BUG-24: `role_helpers.update_user_role` Uses `!= None` Instead of `is not None`
**File:** [role_helpers.py](file:///c:/Users/haris/OneDrive/Documents/Visual%20Codes/Anozon/Anozon-E-commerce/Backend/app/repo/role_helpers.py#L18)

```python
if is_banned != None:  # Should be: if is_banned is not None:
```

Functionally works but violates PEP 8 and can behave unexpectedly with objects that override `__eq__`.

---

## 🔵 LOW (Code quality, minor issues)

| # | File | Issue |
|---|------|-------|
| 25 | `main.py:5` | `from app.ai import ollama` imported at top-level but only used for router |
| 26 | `product_routes.py:5` | `import requests` imported but only used in the duplicate/broken Ollama route |
| 27 | `seller_helpers.py:60` | Duplicate log line: `logger.error(...)` called twice in `soft_delete_seller_product` |
| 28 | `seller_service.py:60` | New product sets `updated_at: None` then `seller_helpers` overwrites it — inconsistent |
| 29 | `auth_service.py:47-69` | Nested try/except: outer catches `PyMongoError` but inner catches generic `Exception`, making the outer block unreachable for DB errors |
| 30 | `security.py:20,27` | `datetime.utcnow()` is deprecated since Python 3.12 |
| 31 | `deps/roles.py:11` | `users_col = Depends(get_users_collection)` parameter is declared but never used |
| 32 | `product_routes.py:73` | Missing leading `/` in route path `"ollama/ai/chat"` |

---

## 📊 Summary

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 Critical | 7 | Crashes, data loss, security vulnerabilities |
| 🟠 High | 7 | Incorrect behavior, data corruption, silent failures |
| 🟡 Medium | 10 | Logic errors, performance issues |
| 🔵 Low | 8 | Code quality, dead code |
| **Total** | **32** | |

---

## 🎯 Recommended Fix Priority

1. **BUG-01** (h11 Request) — Immediate, exception handler is broken
2. **BUG-02** (Redis HTTPException) — Immediate, app won't start if Redis fails
3. **BUG-03** (reset_password TypeError) — Immediate, endpoint is completely broken
4. **BUG-12** (CORS credentials + wildcard) — Immediate, cookies don't work
5. **BUG-07** (Insecure OTP) — High priority security fix
6. **BUG-04** (Stock without rollback) — High priority data integrity
7. **BUG-20** (Banned users can login) — High priority security
8. **BUG-05** (Duplicate routes) — Clean up
9. **BUG-06** (CORS order) — Quick fix
10. Everything else in order of severity
