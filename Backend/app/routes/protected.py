from fastapi import APIRouter, Depends
from app.deps.auth import get_current_user

router = APIRouter(prefix="/secure", tags=["secure"])

@router.get("/me")
async def me(current_user = Depends(get_current_user)):
    return {"email": current_user["email"], "message": "You are authenticated."}
