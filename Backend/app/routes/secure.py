from fastapi import APIRouter, Depends
from app.deps.roles import get_current_user

router = APIRouter(prefix="/secure", tags=["Secure"])


@router.get("/me")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return {
        "_id": current_user["_id"],
        "email": current_user["email"],
        "role": current_user["role"],
    }

