"""Redis-backed rate limiting for seller application resubmissions."""
from app.db.redis import redis_client
import logging

logger = logging.getLogger("uvicorn.error")

# Keys
APPLY_COUNT_KEY = "seller_apply_count:{user_id}"
APPLY_BLOCKED_KEY = "seller_apply_blocked:{user_id}"

# Limits
MAX_REAPPLY_ATTEMPTS = 3
WINDOW_SECONDS = 30 * 24 * 60 * 60  # 30 days


async def is_seller_apply_blocked(user_id: str) -> bool:
    """Check if user is blocked from reapplying."""
    key = APPLY_BLOCKED_KEY.format(user_id=user_id)
    return await redis_client.exists(key) > 0


async def increment_seller_apply_count(user_id: str) -> int:
    """Increment reapplication count. Returns current count after increment.
    Sets TTL of 30 days on first increment. Sets block key if count >= MAX."""
    count_key = APPLY_COUNT_KEY.format(user_id=user_id)
    block_key = APPLY_BLOCKED_KEY.format(user_id=user_id)

    count = await redis_client.incr(count_key)

    # Set TTL only on the first increment (count == 1)
    if count == 1:
        await redis_client.expire(count_key, WINDOW_SECONDS)

    # Block if max attempts reached
    if count >= MAX_REAPPLY_ATTEMPTS:
        await redis_client.setex(block_key, WINDOW_SECONDS, "1")

    return count


async def get_seller_apply_attempts_remaining(user_id: str) -> int:
    """Get remaining reapplication attempts for a user."""
    count_key = APPLY_COUNT_KEY.format(user_id=user_id)
    count = await redis_client.get(count_key)
    if count is None:
        return MAX_REAPPLY_ATTEMPTS
    return max(0, MAX_REAPPLY_ATTEMPTS - int(count))
