from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

# Setup Logger (Critical for Cloud Debugging)
logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None

db_instance = Database()

def get_database_client():
    return db_instance.client

# --- Collections Helper Functions ---
# Note: These will fail if called before "connect_to_mongo" runs
def get_users_collection():
    return db_instance.client[settings.DB_NAME]['Users']

def profiles_collection():
    return db_instance.client[settings.DB_NAME]['Profiles']

def sellers_collection():
    return db_instance.client[settings.DB_NAME]['Sellers']

def audit_logs_collection():
    return db_instance.client[settings.DB_NAME]['AuditLogs']

def reviews_collection():
    return db_instance.client[settings.DB_NAME]['Reviews']

def cart_collection():
    return db_instance.client[settings.DB_NAME]['Cart']

def orders_collection():
    return db_instance.client[settings.DB_NAME]['Orders']

def products_collection():
    return db_instance.client[settings.DB_NAME]['Products']

def banners_collection():
    return db_instance.client[settings.DB_NAME]['Banners']

async def create_indexes():
    """Create all MongoDB indexes. Called once during app startup."""
    db = db_instance.client[settings.DB_NAME]

    # ── Users ──
    await db.Users.create_index("email", unique=True)
    await db.Users.create_index("username", unique=True)

    # ── Profiles & Cart — one-to-one ──
    await db.Profiles.create_index("user_id", unique=True)
    await db.Cart.create_index("user_id", unique=True)

    # ── Products ──
    await db.Products.create_index("slug", unique=True)
    await db.Products.create_index("category")
    # Compound: seller's product list sorted by created_at (replaces standalone seller_id)
    await db.Products.create_index([("seller_id", 1), ("created_at", -1)])
    # Compound: public product listing base filter (replaces standalone is_approved)
    await db.Products.create_index([("is_approved", 1), ("is_active", 1), ("is_deleted", 1)])
    # Full-text search on name + description
    await db.Products.create_index(
        [("name", "text"), ("description", "text")],
        weights={"name": 5, "description": 2},
        name="name_text_description_text"
    )

    # ── Sellers — was completely missing ──
    await db.Sellers.create_index("user_id", unique=True)
    await db.Sellers.create_index("application_status")

    # ── Reviews ──
    # Compound unique: one review per user per product
    await db.Reviews.create_index(
        [("product_id", 1), ("user_id", 1)], unique=True
    )
    # Compound: product reviews sorted by reviewed_at (replaces standalone product_id)
    await db.Reviews.create_index([("product_id", 1), ("reviewed_at", -1)])

    # ── Orders ──
    # Compound: user's order list sorted by date (replaces standalone user_id)
    await db.Orders.create_index([("user_id", 1), ("created_at", -1)])
    # Compound: user's orders filtered by status
    await db.Orders.create_index([("user_id", 1), ("order_status", 1)])
    # Seller's order view — matches on embedded items.seller_id
    await db.Orders.create_index("items.seller_id")
    # Global date range queries (admin)
    await db.Orders.create_index("created_at")

    # ── Audit Logs ──
    await db.AuditLogs.create_index("timestamp")
    await db.AuditLogs.create_index("action")
    await db.AuditLogs.create_index("module")
    await db.AuditLogs.create_index("performed_by.email")
    await db.AuditLogs.create_index("target.email")

    # ── Landing: Flash deals (discount sort with approval filter) ──
    await db.Products.create_index([("discount_percent", -1), ("is_approved", 1), ("is_active", 1)])
    # ── Landing: Top products (rating sort) ──
    await db.Products.create_index([("avg_rating", -1), ("review_count", -1)])
    # ── Landing: Featured products ──
    await db.Products.create_index([("is_featured", 1), ("is_approved", 1), ("is_active", 1)])
    # ── Facets: brand within filtered sets ──
    await db.Products.create_index([("category", 1), ("brand", 1)])
    # ── Facets: sub_category within filtered sets ──
    await db.Products.create_index([("category", 1), ("sub_category", 1)])
    # ── Banners ──
    await db.Banners.create_index([("is_active", 1), ("priority", 1)])

    logger.info("✅ All MongoDB indexes created")


# --- Connection Logic ---
async def connect_to_mongo():
    try:
        logger.info("⏳ Connecting to MongoDB...")
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URL)
        
        # THE PING TEST (Crucial for Cloud)
        await db_instance.client.admin.command('ping')
        logger.info("✅ MongoDB Connected Successfully!")
        
    except Exception as e:
        logger.error(f"❌ MongoDB Connection Failed: {e}")
        raise e


async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("🔒 MongoDB connection closed.")