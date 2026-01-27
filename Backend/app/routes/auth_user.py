from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import Optional
from app.models.user_model import UserCreate, TokenResponse
from app.db.mongodb import get_users_collection
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, verify_token
)
from app.core.config import settings
from passlib.context import CryptContext
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Helper functions
async def get_user_by_email(collection, email: str):
    return await collection.find_one({"email": email})

# SIGNUP
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, users_col=Depends(get_users_collection)):
    existing = await get_user_by_email(users_col, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    doc = {"username": user.username,"email": user.email, "hashed_password": hashed, "refresh_token_hashed": None}
    result = await users_col.insert_one(doc)

    result = str(result.inserted_id)
    return {"message": "User registered successfully"}

# LOGIN (returns access + refresh tokens)
@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), users_col=Depends(get_users_collection)):
    # OAuth2PasswordRequestForm uses form fields "username" and "password"
    user = await get_user_by_email(users_col, form_data.username)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["email"]})
    refresh_token = create_refresh_token({"sub": user["email"]})

    # Hash the refresh token before storing (recommended)
    refresh_hash = hash_password(refresh_token)
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"refresh_token_hashed": refresh_hash}})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# REFRESH — exchange refresh token for a new access token
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str = Body(...), users_col=Depends(get_users_collection)):
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await get_user_by_email(users_col, email)
    if not user or not user.get("refresh_token_hashed"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # verify stored hashed refresh token matches the presented token
    if not verify_password(refresh_token, user["refresh_token_hashed"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # issue new tokens
    new_access = create_access_token({"sub": email})
    new_refresh = create_refresh_token({"sub": email})
    new_refresh_hashed = hash_password(new_refresh)
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"refresh_token_hashed": new_refresh_hashed}})

    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}

# LOGOUT — revoke refresh token (remove from DB)
@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), users_col=Depends(get_users_collection)):
    payload = verify_token(token)
    if not payload:
        # token invalid/expired, but still treat as logged out
        return {"message": "Logged out"}

    email = payload.get("sub")
    await users_col.update_one({"email": email}, {"$set": {"refresh_token_hashed": None}})
    return {"message": "Logged out"}
