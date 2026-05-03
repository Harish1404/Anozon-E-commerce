import redis.asyncio as redis
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn.error")

redis_client = None

async def connect_redis():
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()  # Force actual connection test (from_url is lazy)
        logger.info("Redis connected successfully")
    except Exception as e:
        logger.error(f"Redis connection error: {e}")
        raise RuntimeError(f"Failed to connect to Redis: {e}")

async def close_redis():
    try:
        if redis_client:
            await redis_client.close()
            logger.info("Redis connection closed")
    except Exception as e:
        logger.error(f"Redis connection close error: {e}")
        # Don't raise during shutdown — no request context exists





