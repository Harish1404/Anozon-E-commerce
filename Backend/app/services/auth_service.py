from pymongo.errors import PyMongoError
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.repo.auth_helpers import count_users, insert_user, update_user, get_user_by_email, generate_tokens, update_user_by_email
from app.core.time_utils import now_ist
from app.utils.email import send_forget_password_email
from fastapi import HTTPException, status, Response
from app.utils.cookies import clear_refresh_cookie
from app.services.otp_service import generate_and_store_otp, verify_user_otp
from app.repo.otp_helpers import set_temp_password_token, get_temp_password_token, is_reset_blocked, is_reset_on_cooldown, increment_reset_send_count
import logging
import uuid
from app.db.mongodb import profiles_collection, cart_collection, orders_collection
from app.repo.profiles_helpers import create_empty_profile
from app.repo.cart_helpers import create_empty_cart
from app.repo.orders_helpers import init_user_orders

logger = logging.getLogger("uvicorn.error")

class AuthService:

    @staticmethod
    async def signup(user: dict, user_col):

        # 1. Check if email exists
        # Note: In a high-traffic cloud app, relying only on this Python check is risky 
        # (Race Condition). You should also have a unique index in MongoDB.

        existing = await get_user_by_email(user_col, user.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        # 2. Hash Password
        hashed = hash_password(user.password)
        
        roles = "super_admin" if await count_users(user_col) == 0 else "user"
        # 3. Prepare Data
        user_data = {
            "username": user.username,
            "email": user.email, 
            "hashed_password": hashed, 
            "refresh_token_hashed": None,
            "role": roles, # Explicitly setting default role is safer
            "is_verified": False,
            "created_at": now_ist() # Store creation time and date for auditing
        }
        
        # 4. Safe Database Insertion
        try:

            success, message, otp_token = await generate_and_store_otp(user.email)
            if not success:
                raise HTTPException(status_code=400, detail=message)

            try:    
                logger.info(f"OTP sent to {user.email}")

                result = await insert_user(user_col, user_data)
                # Logging for DevOps visibility
                logger.info(f"Registered, Now please verify your email ")
                return {"message": "User registered successfully, Please verify your email", "otp_token": otp_token}

            except Exception as e:
                logger.error(f"Error inserting user to DB: {e}")
                raise HTTPException(status_code=500, detail="Failed to complete registration")
            
        
        except PyMongoError as e:
            logger.error(f"Signup DB Error: {e}")
            raise HTTPException(status_code=500, detail="Signup failed due to server error")

    @staticmethod
    async def verify_otp(otp_token: str, otp: str, user_col):
        is_valid, message, email = await verify_user_otp(otp_token, otp)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
            
        user = await get_user_by_email(user_col, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("is_verified"):
            raise HTTPException(status_code=400, detail="Email is already verified")
            
        try:
            access_token, refresh_token = await generate_tokens(user["email"], user["role"], user_col)
            refresh_hash = hash_password(refresh_token)

            # 1. Mark user as verified
            await update_user(user_col, user["_id"], {"is_verified": True, "refresh_token_hashed": refresh_hash})
            
            # 2. Initialize User Data (Profile, Cart, Orders)
            user_id_str = str(user["_id"])
            await create_empty_profile(profiles_collection(), user_id_str, email)
            await create_empty_cart(cart_collection(), user_id_str)
            await init_user_orders(orders_collection(), user_id_str)

            logger.info(f"User {email} verified and data initialized successfully")
            return {"access_token": access_token, "refresh_token": refresh_token, "role": user["role"], "token_type": "bearer"}

        except PyMongoError as e:
            logger.error(f"Verify OTP DB Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to update verification status or initialize data")

    @staticmethod
    async def resend_otp(email: str, user_col):
        user = await get_user_by_email(user_col, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("is_verified"):
            raise HTTPException(status_code=400, detail="Email is already verified")
            
        success, message, otp_token = await generate_and_store_otp(email)
        if not success:
            raise HTTPException(status_code=400, detail=message)
            
        logger.info(f"OTP resent to {email}")
        return {"message": "OTP sent successfully.", "otp_token": otp_token}

    @staticmethod
    async def login(email: str, password: str, user_col):
        # OAuth2PasswordRequestForm uses form fields "username" and "password"
        user = await get_user_by_email(user_col, email)
        
        if not user or not verify_password(password, user["hashed_password"]):
            logger.warning(f"Login failed for user: {email}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        if not user.get("is_verified", False):
            logger.warning(f"Login failed: User {email} is not verified")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please verify your OTP.")

        access_token, refresh_token = await generate_tokens(user["email"], user["role"], user_col)

        # Hash the refresh token before storing (recommended)
        refresh_hash = hash_password(refresh_token)

        try:
            await update_user(user_col, user["_id"], {"refresh_token_hashed": refresh_hash})
            logger.info(f"User {user['email']} logged in successfully")

        except PyMongoError as e:
            logger.error(f"Login DB Update Error: {e}")
            raise HTTPException(status_code=500, detail="Login failed")

        return {"access_token": access_token, "refresh_token": refresh_token, "role": user["role"], "token_type": "bearer"}

    @staticmethod
    async def refresh_token(actual_token: str, user_col):
        payload = verify_token(actual_token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token structure")

        email = payload.get("sub")
        user = await get_user_by_email(user_col, email)

        # Validate User and Token
        if not user or not user.get("refresh_token_hashed"):
            logger.warning(f"Refresh failed: User {email} has no active token")
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        if not verify_password(actual_token, user["refresh_token_hashed"]):
            logger.critical(f"Security Alert: Reused/Invalid refresh token for {email}") # Critical Alert
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Issue New Tokens
        new_access = create_access_token({"sub": email, "role": user["role"]})
        new_refresh = create_refresh_token({"sub": email})
        new_refresh_hashed = hash_password(new_refresh)

        try:
            await update_user(user_col, user["_id"], {"refresh_token_hashed": new_refresh_hashed})
            return {"access_token": new_access, "refresh_token": new_refresh, "role": user["role"], "token_type": "bearer"}
        except PyMongoError as e:
            logger.error(f"Refresh Token DB Update Error for {email}: {e}")
            raise HTTPException(status_code=500, detail="Token refresh failed")

    @staticmethod
    async def logout(token: str, user_col):
        payload = verify_token(token)
        if not payload:
            return {"message": "Logged out (Token expired)"}

        email = payload.get("sub")
        try:
            await update_user_by_email(user_col, email, {"refresh_token_hashed": None})
        except PyMongoError as e:
            logger.error(f"Logout DB Update Error for {email}: {e}")
            # We still return success since the token is cleared on frontend anyway
        
        logger.info(f"User {email} logged out")
        return {"message": "Logged out"}

    @staticmethod
    async def forget_password(email: str, user_col):
        if await is_reset_blocked(email):
            raise HTTPException(status_code=403, detail="Too many requests. Please try again later.")

        if await is_reset_on_cooldown(email):
            raise HTTPException(status_code=429, detail="Please wait before requesting another reset.")

        user = await get_user_by_email(user_col, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.get("is_verified", False):
            raise HTTPException(status_code=403, detail="User is not verified")

        token = str(uuid.uuid4())
        await set_temp_password_token(email, token)

        email_sent = await send_forget_password_email(email, token)
        if not email_sent:
            logger.error(f"Failed to send forget password email to {email}")
            raise HTTPException(status_code=500, detail="Failed to send forget password email")

        await increment_reset_send_count(email)

        logger.info(f"Forget password email sent to {email}")
        return {"message": "Forget password email sent successfully"}

    @staticmethod
    async def reset_password(email: str, token: str, new_password: str, user_col, response: Response):
        user = await get_user_by_email(user_col, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.get("is_verified", False):
            raise HTTPException(status_code=403, detail="User is not verified")

        temp_token = await get_temp_password_token(email)
        if not temp_token or temp_token != token:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link")

        try:
            await update_user(user_col, user["_id"], {"hashed_password": hash_password(new_password)})
            await set_temp_password_token(email, None) 
            
            clear_refresh_cookie(response)
            
            logger.info(f"User {email} reset password successfully")
            return {"message": "Password reset successful"}
        except PyMongoError as e:
            logger.error(f"Reset Password DB Update Error for {email}: {e}")
            raise HTTPException(status_code=500, detail="Password reset failed")
    
    


            