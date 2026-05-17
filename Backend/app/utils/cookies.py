from fastapi import Response

COOKIE_KEY = "refresh_token"
COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds

def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key=COOKIE_KEY,
        value=refresh_token,
        httponly=True,           # JS cannot access — XSS protection
        secure=True,             # HTTPS only in prod
        samesite="lax",          # CSRF protection
        max_age=COOKIE_MAX_AGE,
        path="/",                # Cookie sent to all routes
    )

def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key=COOKIE_KEY,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )


