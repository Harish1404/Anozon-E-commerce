import uuid
import logging
from app.repo import otp_helpers
from app.utils.otp import generate_otp
from app.utils.email import send_otp_email
from app.repo.otp_helpers import MAX_ATTEMPTS, MAX_RESEND_ATTEMPTS

logger = logging.getLogger("uvicorn.error")


async def generate_and_store_otp(email: str) -> tuple[bool, str, str]:
    """
    Checks if email is blocked or in cooldown. If not, generates OTP, stores it,
    sends email, and returns (success, message, otp_token).
    """
    # 1. Check if blocked
    if await otp_helpers.is_blocked(email):
        return False, "Account temporarily blocked due to too many failed attempts.", ""
        
    # 2. Check cooldown
    if await otp_helpers.is_cooldown(email):
        return False, f"Please wait {otp_helpers.RESEND_COOLDOWN} seconds before requesting a new OTP.", ""

    try:
        # 3. Check max resend attempts
        resend_attempts = await otp_helpers.increment_resend_attempts(email)
        if resend_attempts > MAX_RESEND_ATTEMPTS:
            await otp_helpers.block_email(email)
            return False, "Too many resend requests. Account temporarily blocked.", ""

        # 4. Generate OTP & Token
        otp = generate_otp()
        otp_token = str(uuid.uuid4())

        # 4. Store OTP data
        await otp_helpers.set_otp_data(otp_token, email, otp)

        # 5. Send email
        email_sent = await send_otp_email(email, otp)
        if not email_sent:
            logger.error(f"Failed to send OTP to {email}")
            return False, "Failed to send OTP email.", ""

        # 6. Set cooldown
        await otp_helpers.set_cooldown(email)

        logger.info(f"OTP generated and sent to {email}")
        return True, "OTP sent successfully.", otp_token
    except Exception as e:
        logger.error(f"Error in generate_and_store_otp for {email}: {e}")
        return False, "An internal error occurred while processing OTP.", ""


async def verify_user_otp(otp_token: str, user_otp: str) -> tuple[bool, str, str]:
    """
    Verifies the OTP using the otp_token.
    Returns (is_valid, message, email).
    """
    try:
        # 1. Retrieve OTP data
        otp_data = await otp_helpers.get_otp_data(otp_token)
        if not otp_data:
            return False, "OTP expired or invalid token.", ""

        email = otp_data["email"]
        stored_otp = otp_data["otp"]

        # 2. Check if blocked
        if await otp_helpers.is_blocked(email):
            return False, "Account temporarily blocked due to too many failed attempts.", email

        # 3. Verify OTP
        if stored_otp != user_otp:
            attempts = await otp_helpers.increment_attempts(email)
            if attempts >= MAX_ATTEMPTS:
                await otp_helpers.block_email(email)
                await otp_helpers.delete_otp_data(otp_token)
                return False, "Too many failed attempts. Account temporarily blocked.", email
            
            remaining = MAX_ATTEMPTS - attempts
            return False, f"Invalid OTP. {remaining} attempts remaining.", email

        # 4. Success - clean up
        await otp_helpers.delete_otp_data(otp_token)
        await otp_helpers.reset_attempts(email)

        logger.info(f"OTP verified successfully for {email}")
        return True, "OTP verified successfully.", email
    except Exception as e:
        logger.error(f"Error in verify_user_otp for token {otp_token}: {e}")
        return False, "An internal error occurred during OTP verification.", ""


