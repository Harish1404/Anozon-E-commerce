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
   
async def create_indexes():  

    # Create text index on product name
    await products_collection().create_index([("name", "text")], weights = {"name": 5, "description":2 }, name = "name_text_description_text")


async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("🔒 MongoDB connection closed.")