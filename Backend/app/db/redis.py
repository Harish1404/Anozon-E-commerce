import redis.asyncio as redis
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn.error")

redis_client = None

async def connect_redis():
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        logger.info("Redis connected successfully")
    except Exception as e:
        logger.error(f"Redis connection error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to Redis")

async def close_redis():
    try:
        await redis_client.close()
        logger.info("Redis connection closed")
    except Exception as e:
        logger.error(f"Redis connection close error: {e}")
        raise HTTPException(status_code=500, detail="Failed to close Redis connection")





