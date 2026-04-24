import json
from app.db import redis as redis_db

expiry_time = 300
MAX_ATTEMPTS = 5
MAX_RESEND_ATTEMPTS = 3
BLOCKTIME = 600
RESEND_COOLDOWN = 60

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


async def set_temp_password_token(email: str, token: str):
    """Stores a temporary token for password reset."""
    key = f"temp_password:{email}"
    await redis_db.redis_client.set(key, token, ex=3600)

async def get_temp_password_token(email: str):
    """Retrieves and deletes a temporary token for password reset."""
    key = f"temp_password:{email}"
    return await redis_db.redis_client.get(key)


