from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from app.utils.cookies import set_refresh_cookie, clear_refresh_cookie
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import logging
from app.models.user_model import *
from app.services.auth_service import AuthService
from app.db.mongodb import get_users_collection

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# SIGNUP
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserRegister, users_col=Depends(get_users_collection)):
    return await AuthService.signup(user, users_col)

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp(request: OTPVerifyRequest, response: Response, users_col=Depends(get_users_collection)):
    result = await AuthService.verify_otp(request.otp_token, request.otp, users_col)
    set_refresh_cookie(response, result["refresh_token"])
    return result

@router.post("/resend-otp", status_code=status.HTTP_200_OK)
async def resend_otp(request: ResendOTPRequest, users_col=Depends(get_users_collection)):
    return await AuthService.resend_otp(request.email, users_col)

# LOGIN (returns access + refresh tokens)
@router.post("/login", response_model=TokenResponse)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), users_col=Depends(get_users_collection)):
    result = await AuthService.login(form_data.username, form_data.password, users_col)
    set_refresh_cookie(response, result["refresh_token"])
    return result

# REFRESH — exchange refresh token for a new access token
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(response: Response, token: RefreshTokenRequest | None = None, refresh_token: str | None = Cookie(default=None), users_col=Depends(get_users_collection)):
    actual_token = refresh_token or (token.refresh_token if token else None)
    
    if not actual_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    result = await AuthService.refresh_token(actual_token, users_col)
    set_refresh_cookie(response, result["refresh_token"])
    
    return result

# LOGOUT — revoke refresh token (remove from DB)
@router.post("/logout")
async def logout(response: Response, token: str = Depends(oauth2_scheme), users_col=Depends(get_users_collection)):
    clear_refresh_cookie(response)
    result = await AuthService.logout(token, users_col)
    return result

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest, users_col=Depends(get_users_collection)):
    return await AuthService.forget_password(request.email, users_col)

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, users_col=Depends(get_users_collection)):
    return await AuthService.reset_password(request.email, request.otp_token, request.new_password, users_col)

