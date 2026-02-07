import contextlib
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.models.user_model import *
from app.db.mongodb import get_users_collection
from app.core.security import (hash_password, verify_password,create_access_token, create_refresh_token, verify_token)
from pymongo.errors import PyMongoError

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Helper functions
async def get_user_by_email(collection, email: str):
    try:
        return await collection.find_one({"email": email})
    except PyMongoError as e:
        logger.error(f"DB Error fetching user {email}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

# SIGNUP
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserRegister, users_col=Depends(get_users_collection)):

    # 1. Check if email exists
    # Note: In a high-traffic cloud app, relying only on this Python check is risky 
    # (Race Condition). You should also have a unique index in MongoDB.
    existing = await get_user_by_email(users_col, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash Password
    hashed = hash_password(user.password)
    
    # 3. Prepare Data
    user_data = {
        "username": user.username,
        "email": user.email, 
        "hashed_password": hashed, 
        "refresh_token_hashed": None,
        "role": "user" # Explicitly setting default role is safer
    }
    
    # 4. Safe Database Insertion
    try:
        result = await users_col.insert_one(user_data)
        # Logging for DevOps visibility
        logger.info(f"New user registered: {user.email}") 
        return {"message": "User registered successfully", "id": str(result.inserted_id)}
    
    except PyMongoError as e:
        logger.error(f"Signup DB Error: {e}")
        raise HTTPException(status_code=500, detail="Signup failed due to server error")

# LOGIN (returns access + refresh tokens)
@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), users_col=Depends(get_users_collection)):
    # OAuth2PasswordRequestForm uses form fields "username" and "password"
    user = await get_user_by_email(users_col, form_data.username)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["email"], "role": user["role"]})
    refresh_token = create_refresh_token({"sub": user["email"]})

    # Hash the refresh token before storing (recommended)
    refresh_hash = hash_password(refresh_token)

    try:
        await users_col.update_one(
            {"_id": user["_id"]}, 
            {"$set": {"refresh_token_hashed": refresh_hash}}
        )
        logger.info(f"User {user['email']} logged in successfully")

    except PyMongoError as e:
        logger.error(f"Login DB Update Error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

    return {"access_token": access_token, "refresh_token": refresh_token, "role": user["role"], "token_type": "bearer"}

# REFRESH — exchange refresh token for a new access token
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token: RefreshTokenRequest , users_col=Depends(get_users_collection)):
    refresh_token = token.refresh_token

    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token structure")

    email = payload.get("sub")
    user = await get_user_by_email(users_col, email)

    # Validate User and Token
    if not user or not user.get("refresh_token_hashed"):
        logger.warning(f"Refresh failed: User {email} has no active token")
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if not verify_password(refresh_token, user["refresh_token_hashed"]):
        logger.critical(f"Security Alert: Reused/Invalid refresh token for {email}") # Critical Alert
        # Ideally, you might want to revoke ALL tokens for this user here if you suspect theft
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Issue New Tokens
    new_access = create_access_token({"sub": email, "role": user["role"]})
    new_refresh = create_refresh_token({"sub": email})
    new_refresh_hashed = hash_password(new_refresh)

    await users_col.update_one({"_id": user["_id"]}, {"$set": {"refresh_token_hashed": new_refresh_hashed}})
    
    return {"access_token": new_access, "refresh_token": new_refresh, "role": user["role"], "token_type": "bearer"}

# LOGOUT — revoke refresh token (remove from DB)
@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), users_col=Depends(get_users_collection)):

    payload = verify_token(token)

    if not payload:
        return {"message": "Logged out (Token expired)"}

    email = payload.get("sub")
    with contextlib.suppress(PyMongoError):
        await users_col.update_one({"email": email}, {"$set": {"refresh_token_hashed": None}})
        logger.info(f"User {email} logged out")
    return {"message": "Logged out"}
