from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

users_collection = db['Users']
products_collection = db["Products"]
file_collection = db["Files"]  

def get_products_collection():
    return products_collection

def get_users_collection():
    return users_collection

def get_file_collection():
    return file_collection

