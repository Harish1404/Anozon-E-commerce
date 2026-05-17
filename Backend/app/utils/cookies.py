from fastapi import Response
import os

COOKIE_KEY = "refresh_token"
COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days

def get_cookie_settings():
    """Return cookie settings based on environment"""
    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
    
    if is_prod:
        # Production (Cross-domain: Vercel + Render)
        return {
            "httponly": True,
            "secure": True,           # Required for cross-domain
            "samesite": "none",       # Required for cross-domain
            "max_age": COOKIE_MAX_AGE,
            "path": "/",
        }
    else:
        # Local Development
        return {
            "httponly": True,
            "secure": False,          # False because localhost is HTTP
            "samesite": "lax",        # More lenient in dev
            "max_age": COOKIE_MAX_AGE,
            "path": "/",
        }


def set_refresh_cookie(response: Response, refresh_token: str):
    settings = get_cookie_settings()
    
    response.set_cookie(
        key=COOKIE_KEY,
        value=refresh_token,
        **settings
    )


def clear_refresh_cookie(response: Response):
    settings = get_cookie_settings()
    
    # Browsers REQUIRE SameSite and Secure to match when deleting cross-domain cookies
    response.delete_cookie(
        key=COOKIE_KEY,
        path=settings["path"],
        secure=settings["secure"],
        samesite=settings["samesite"],
        httponly=settings["httponly"]
    )