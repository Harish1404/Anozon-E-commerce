import logging
from pymongo.errors import PyMongoError
from fastapi import HTTPException
from typing import Optional
from datetime import datetime

logger = logging.getLogger("uvicorn.error")


async def insert_audit_log(collection, log_data: dict):
    try:
        result = await collection.insert_one(log_data)
        return result
    except PyMongoError as e:
        logger.error(f"DB Error inserting audit log: {e}")
        # Audit failures should not crash the main operation
        # So we log but don't raise


async def fetch_audit_logs(
    collection,
    module: Optional[str] = None,
    action: Optional[str] = None,
    performed_by_email: Optional[str] = None,
    target_email: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 20
) -> list:
    """Fetch audit logs with optional filters."""
    try:
        query = {}

        if module:
            query["module"] = module
        if action:
            query["action"] = action
        if performed_by_email:
            query["performed_by.email"] = performed_by_email
        if target_email:
            query["target.email"] = target_email
        if date_from or date_to:
            query["timestamp"] = {}
            if date_from:
                query["timestamp"]["$gte"] = date_from
            if date_to:
                query["timestamp"]["$lte"] = date_to

        cursor = collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        logs = await cursor.to_list(length=limit)

        # Get total count for pagination
        total = await collection.count_documents(query)

        return {"logs": logs, "total": total}
    except PyMongoError as e:
        logger.error(f"DB Error fetching audit logs: {e}")
        raise HTTPException(status_code=500, detail="Database error")
