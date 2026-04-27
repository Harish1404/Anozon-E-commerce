import json
from app.db import redis as redis_db

expiry_time = 300
MAX_ATTEMPTS = 5
MAX_RESEND_ATTEMPTS = 3
BLOCKTIME = 600
RESEND_COOLDOWN = 60

RESET_TOKEN_TTL = 900          # token valid 15 min 
RESET_MAX_SENDS = 3            # stricter than OTP — email link doesn't need 5
RESET_BLOCK_TIME = 1800        # block 30 min after 3 attempts
RESET_RESEND_COOLDOWN = 120    # must wait 2 min between sends (longer than OTP)

# OTP Data (otp_token -> email & otp)
async def set_otp_data(otp_token: str, email: str, otp: str):
    key = f"otp_data:{otp_token}"
    data = json.dumps({"email": email, "otp": otp})
    await redis_db.redis_client.set(key, data, ex=expiry_time)

async def get_otp_data(otp_token: str):
    key = f"otp_data:{otp_token}"
    data = await redis_db.redis_client.get(key)
    if data:
        return json.loads(data)
    return None

async def delete_otp_data(otp_token: str):
    key = f"otp_data:{otp_token}"
    await redis_db.redis_client.delete(key)

# Cooldown (preventing spam resend)
async def set_cooldown(email: str):
    key = f"otp_cooldown:{email}"
    await redis_db.redis_client.set(key, "1", ex=RESEND_COOLDOWN)

async def is_cooldown(email: str) -> bool:
    key = f"otp_cooldown:{email}"
    return await redis_db.redis_client.exists(key)

# Blocking (max attempts)
async def increment_attempts(email: str) -> int:
    key = f"otp_attempts:{email}"
    attempts = await redis_db.redis_client.incr(key)
    if attempts == 1:
        await redis_db.redis_client.expire(key, expiry_time)
    return attempts

async def reset_attempts(email: str):
    key = f"otp_attempts:{email}"
    await redis_db.redis_client.delete(key)

async def block_email(email: str):
    key = f"otp_blocked:{email}"
    await redis_db.redis_client.set(key, "1", ex=BLOCKTIME)

async def is_blocked(email: str) -> bool:
    key = f"otp_blocked:{email}"
    return await redis_db.redis_client.exists(key)

# Resend tracking
async def increment_resend_attempts(email: str) -> int:
    key = f"otp_resend_attempts:{email}"
    attempts = await redis_db.redis_client.incr(key)
    if attempts == 1:
        # Keep track of resends for the block time duration to prevent abuse
        await redis_db.redis_client.expire(key, BLOCKTIME)
    return attempts


async def set_temp_password_token(email: str, token: str | None):
    """Stores a temporary token for password reset."""
    key = f"temp_password:{email}"
    if token is None:
        await redis_db.redis_client.delete(key)
    else:
        await redis_db.redis_client.set(key, token, ex=RESET_TOKEN_TTL)

async def get_temp_password_token(email: str):
    """Retrieves and deletes a temporary token for password reset."""
    key = f"temp_password:{email}"
    return await redis_db.redis_client.get(key)

# ── new rate limiting ────────────────────────────────────────────────────────

async def is_reset_blocked(email: str) -> bool:
    return bool(await redis_db.redis_client.exists(f"reset_blocked:{email}"))


async def is_reset_on_cooldown(email: str) -> bool:
    return bool(await redis_db.redis_client.exists(f"reset_cooldown:{email}"))


async def increment_reset_send_count(email: str):
    count_key = f"reset_send_count:{email}"
    count = await redis_db.redis_client.incr(count_key)

    if count == 1:
        # Start the window on first request
        await redis_db.redis_client.expire(count_key, RESET_BLOCK_TIME)

    if count >= RESET_MAX_SENDS:
        await redis_db.redis_client.set(
            f"reset_blocked:{email}", "1", ex=RESET_BLOCK_TIME
        )

    await redis_db.redis_client.set(
        f"reset_cooldown:{email}", "1", ex=RESET_RESEND_COOLDOWN
    )



