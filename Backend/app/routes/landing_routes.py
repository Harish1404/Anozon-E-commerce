"""
Landing page & Banner management routes.
- GET /landing — Public composite endpoint (cached)
- Admin Banner CRUD — Protected by require_permission("product:approve")
"""

from fastapi import APIRouter, Depends, HTTPException
from app.deps.roles import require_permission
from app.models.banner_model import BannerCreate, BannerUpdate
from app.services.landing_service import LandingService

router = APIRouter(tags=["Landing Page & Banners"])


# ── Public Landing Page ───────────────────────────────────────────────────────

@router.get("/landing")
async def get_landing_page():
    """
    Single composite endpoint returning all landing page sections:
    banners, categories, flash_deals, top_products, new_arrivals, featured.
    Responses are cached in Redis for 5 minutes.
    """
    return await LandingService.get_landing_page()


# ── Admin Banner CRUD Management ─────────────────────────────────────────────

@router.post("/admin/banners")
async def create_banner(
    payload: BannerCreate,
    current_user: dict = Depends(require_permission("product:approve"))
):
    """Admin endpoint to create a new carousel/slide banner."""
    return await LandingService.create_banner(payload)


@router.get("/admin/banners")
async def list_banners_for_admin(
    current_user: dict = Depends(require_permission("product:approve"))
):
    """Admin endpoint to list all banners (active & inactive) for management."""
    return await LandingService.get_all_banners()


@router.put("/admin/banners/{banner_id}")
async def update_banner(
    banner_id: str,
    payload: BannerUpdate,
    current_user: dict = Depends(require_permission("product:approve"))
):
    """Admin endpoint to update banner details, priority, or active status."""
    return await LandingService.update_banner(banner_id, payload)


@router.delete("/admin/banners/{banner_id}")
async def delete_banner(
    banner_id: str,
    current_user: dict = Depends(require_permission("product:approve"))
):
    """Admin endpoint to permanently delete a banner slide."""
    return await LandingService.delete_banner(banner_id)
