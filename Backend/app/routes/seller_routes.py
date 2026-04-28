from fastapi import APIRouter, Depends, HTTPException, status
from app.deps.roles import require_permission, get_current_user
from app.models.seller_model import SellerApplicationRequest
from app.services.seller_service import apply_for_seller
from app.db.mongodb import get_users_collection

router = APIRouter(prefix="/seller", tags=["Seller Application"])

@router.post("/apply")
async def submit_seller_application(
    payload: SellerApplicationRequest,
    current_user: dict = Depends(require_permission("seller:apply"))
):
    """
    Submit an application to become a seller.
    Only users with 'seller:apply' permission (i.e., regular users) can do this.
    """
    email = current_user.get("email")
    user = await get_users_collection().find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return await apply_for_seller(str(user["_id"]), payload)

