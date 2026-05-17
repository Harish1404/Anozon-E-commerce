from fastapi import APIRouter, Depends, Query, Path
from app.deps.roles import get_current_user
from app.services.review_service import ReviewService
from app.models.reviews_model import ReviewCreate

router = APIRouter(tags=["Reviews"])


# --- Public: Product Reviews ---

@router.get("/products/{product_id}/reviews")
async def get_product_reviews(
    product_id: str = Path(..., description="Product ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Reviews per page")
):
    """Get public reviews for a product"""
    return await ReviewService.get_product_reviews(product_id, page, limit)


# --- Authenticated: Write Review ---

@router.post("/users/reviews", status_code=201)
async def write_review(
    payload: ReviewCreate,
    current_user=Depends(get_current_user)
):
    """Write a review for a product from a delivered order"""
    return await ReviewService.write_review(
        user_id=str(current_user["_id"]),
        review_data=payload.model_dump()
    )

