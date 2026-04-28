import logging
from pymongo.errors import PyMongoError
from fastapi import HTTPException

logger = logging.getLogger("uvicorn.error")

async def insert_audit_log(collection, log_data: dict):
    try:
        result = await collection.insert_one(log_data)
        return result
    except PyMongoError as e:
        logger.error(f"DB Error inserting audit log: {e}")
        raise HTTPException(status_code=500, detail="Database error")

async def fetch_audit_logs(collection, limit: int = 50, skip: int = 0):
    try:
        cursor = collection.find().sort("timestamp", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except PyMongoError as e:
        logger.error(f"DB Error fetching audit logs: {e}")
        raise HTTPException(status_code=500, detail="Database error")
