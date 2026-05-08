# Anozon Backend

FastAPI backend for the Anozon e-commerce platform.

**API Docs:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc

---



## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| Database | MongoDB (Motor async driver) |
| Cache / OTP Store | Redis |
| Auth | JWT (python-jose) + bcrypt |
| Validation | Pydantic v2 + pydantic-settings |
| Email | fastapi-mail (SMTP) |
| AI | Ollama (self-hosted LLM) |
| Testing | pytest + pytest-asyncio |

---

## Project Structure

```
Backend/
├── app/
│   ├── main.py                  # App factory, lifespan, CORS, router registration
│   ├── ai/
│   │   └── ollama.py            # Ollama AI chat endpoint
│   ├── core/
│   │   ├── config.py            # Pydantic settings (env vars)
│   │   ├── security.py          # JWT creation/verification, bcrypt hashing
│   │   ├── logger.py            # Uvicorn logger config
│   │   └── time_utils.py        # UTC time helpers
│   ├── db/
│   │   ├── mongodb.py           # Motor client, collection accessors, indexes
│   │   └── redis.py             # Redis async client
│   ├── deps/
│   │   └── roles.py             # get_current_user, require_role, require_permission
│   ├── models/
│   │   ├── user_model.py        # UserRegister, UserInDB, TokenResponse, OTP models
│   │   ├── product_model.py     # ProductCreate, ProductUpdate, PaginatedProductResponse
│   │   ├── cart_model.py        # CartItem, WishlistRequest
│   │   ├── orders_model.py      # PlaceOrderRequest, BuyNowRequest, OrderItemStatusUpdate
│   │   ├── profiles_model.py    # UpdateProfileRequest, AddAddressRequest
│   │   ├── reviews_model.py     # ReviewCreate
│   │   ├── seller_model.py      # SellerApplicationRequest, SellerProfileUpdate
│   │   └── audit_model.py       # Audit log schema
│   ├── repo/                    # Raw DB query helpers (one file per domain)
│   ├── routes/
│   │   ├── auth_user.py         # /auth/*
│   │   ├── secure.py            # /secure/me
│   │   ├── user_routes.py       # /users/*
│   │   ├── product_routes.py    # /products/*, /categories/*
│   │   ├── review_routes.py     # /products/{id}/reviews, /users/reviews
│   │   ├── seller_routes.py     # /seller/*
│   │   ├── admin_routes.py      # /admin/*
│   │   └── super_admin_routes.py# /super-admin/*
│   ├── services/                # Business logic layer (one file per domain)
│   └── utils/
│       ├── cookies.py           # HttpOnly refresh token cookie helpers
│       ├── email.py             # Email sending utility
│       ├── otp.py               # OTP generation
│       ├── discount.py          # Discount calculation helpers
│       ├── order_utils.py       # Order helpers
│       └── serializer.py        # MongoDB document serializer
├── tests/
│   ├── auth_test.py
│   ├── user_test.py
│   ├── seller_test.py
│   └── main_test.py
├── server.py                    # Uvicorn entry point
├── requirements.txt
├── dockerfile
└── .env.example
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=anozon

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secure-random-secret-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (SMTP)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_APP=Anozon

# Ollama AI
OLLAMA_API_URL=your-ollama-api-key
OLLAMA_URL=http://localhost:11434
```

---

## Running Locally

```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
python server.py
```

Server starts at `http://localhost:8000`

---

## Role & Permission System

Four roles with granular permissions defined in `deps/roles.py`:

| Role | Key Permissions |
|---|---|
| `user` | Browse products, cart, orders, reviews, apply as seller |
| `seller` | Manage own products/stock, view own orders, update order item status |
| `admin` | Approve/reject/suspend sellers, approve products, ban users |
| `super_admin` | All admin permissions + promote/demote admins, view audit logs |

Use `Depends(require_permission("permission:name"))` on any route to enforce access.

---

## API Reference

### Auth — `/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register — triggers OTP email |
| POST | `/auth/verify-otp` | Verify OTP, receive tokens |
| POST | `/auth/resend-otp` | Resend OTP to email |
| POST | `/auth/login` | Login (form data), receive tokens |
| POST | `/auth/refresh` | Refresh access token (cookie or body) |
| POST | `/auth/forgot-password` | Send password reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP token |
| POST | `/auth/logout` | Revoke refresh token, clear cookie |

> Refresh token is stored as an `HttpOnly`, `Secure`, `SameSite=lax` cookie. It is also hashed and stored in the DB for revocation.

---

### Identity — `/secure`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/secure/me` | Returns `_id`, `email`, `role` from JWT |

---

### Products — `/products`, `/categories` (Public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Paginated list with filters |
| GET | `/products/search` | Full-text search (`?q=`) |
| GET | `/products/{id}` | Single product detail |
| GET | `/categories` | All available categories |
| GET | `/categories/{category}` | Products by category |

**Filter params for `GET /products`:**
`category`, `min_price`, `max_price`, `min_discount`, `min_rating`, `in_stock`, `search`, `sort_by`, `sort_order`, `page`, `limit`

---

### User Features — `/users` (Authenticated)

#### Profile & Addresses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/profile` | Get profile + addresses |
| PUT | `/users/profile` | Update profile info |
| POST | `/users/addresses` | Add delivery address |
| PUT | `/users/addresses/{id}` | Update address |
| DELETE | `/users/addresses/{id}` | Delete address |

#### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/cart` | View cart with totals |
| POST | `/users/cart` | Add item / increase quantity |
| PUT | `/users/cart` | Set exact quantity |
| DELETE | `/users/cart/{product_id}` | Remove item from cart |

#### Favorites / Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/favorites` | View wishlist |
| POST | `/users/favorites/toggle` | Toggle product in wishlist |

#### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/orders` | List own orders (filterable by status) |
| GET | `/users/orders/{id}` | Order detail with tracking |
| POST | `/users/orders` | Place order from cart |
| POST | `/users/orders/buy-now` | Buy single product directly |
| PATCH | `/users/orders/{id}/cancel` | Cancel order or specific item |

#### Seller Application
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/seller-apply` | Submit seller application |
| GET | `/users/seller-apply/status` | Check application status |

---

### Reviews (Mixed)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products/{id}/reviews` | Public | Get product reviews |
| POST | `/users/reviews` | User | Write review (requires delivered order) |

---

### Seller Dashboard — `/seller` (Seller only)

#### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/seller/profile` | Get seller profile |
| PUT/PATCH | `/seller/profile` | Update seller profile |

#### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/seller/dashboard` | Stats: products, orders, revenue, rating |
| POST | `/seller/products` | Create product (pending approval) |
| GET | `/seller/products` | List own products (paginated) |
| GET | `/seller/products/{id}` | Single product detail |
| PUT | `/seller/products/{id}` | Update product |
| PATCH | `/seller/products/{id}/toggle` | Toggle product active/inactive |
| PATCH | `/seller/products/{id}/stock` | Update stock quantity |
| DELETE | `/seller/products/{id}` | Delete product |
| GET | `/seller/products/{id}/reviews` | View reviews for own product |

#### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/seller/orders` | List orders containing own products |
| GET | `/seller/orders/{id}` | Order detail |
| PATCH | `/seller/orders/{order_id}/items/{product_id}/status` | Update item shipping status |

---

### Admin — `/admin` (Admin / Super Admin)

#### Seller Management
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/sellers/pending` | List pending seller applications |
| POST | `/admin/sellers/{id}/approve` | Approve seller |
| POST | `/admin/sellers/{id}/reject` | Reject with reason |
| POST | `/admin/sellers/{id}/suspend` | Suspend seller |
| POST | `/admin/sellers/{id}/unsuspend` | Unsuspend seller |

#### Product Moderation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/products/pending` | List products awaiting approval |
| POST | `/admin/products/{id}/approve` | Approve product listing |
| POST | `/admin/products/{id}/reject` | Reject with reason |

#### User Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/users/{id}/ban` | Ban a user |

---

### Super Admin — `/super-admin` (Super Admin only)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/super-admin/promote-admin/{id}` | Promote user to admin |
| POST | `/super-admin/demote/{id}` | Demote admin to user |
| GET | `/super-admin/audit-logs` | View all audit logs with filters |

**Audit log filters:** `module`, `action`, `performed_by`, `target`, `date_from`, `date_to`, `page`, `limit`

---

### AI — `/ollama` (Public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ollama/ai/chat` | Chat with Ollama LLM (`?message=`) |

Uses `qwen3-coder:480b-cloud` model via self-hosted Ollama instance.

---

### System

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Landing / health check |
| GET | `/health` | Returns `{"status": "ok"}` |

---

## Authentication Flow

```
1. POST /auth/signup        → OTP sent to email
2. POST /auth/verify-otp    → access_token + refresh_token (cookie)
3. GET  /secure/me          → fetch user identity
4. POST /auth/refresh       → new access_token (uses HttpOnly cookie)
5. POST /auth/logout        → clears cookie, revokes refresh token in DB
```

Password reset flow:
```
1. POST /auth/forgot-password   → OTP sent to email
2. POST /auth/reset-password    → new password set with OTP token
```

---

## Testing

```bash
# Run all tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=term-missing

# Specific file
pytest tests/auth_test.py -v
```

---

## Docker

```bash
# From project root
docker-compose build backend
docker-compose up -d backend

# Logs
docker-compose logs -f backend

# Shell access
docker-compose exec backend bash
```
