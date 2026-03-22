from fastapi import APIRouter, HTTPException, Query, Path
from app.services.product_service import ProductService
from app.models.product_model import *

router = APIRouter(tags=["public product routes"])

@router.get("/products")
async def get_products(
    category: Optional[str] = Query(None, description="Category name (case-insensitive)"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    sort_by: str = Query("price", description="Field to sort by (e.g., price, name)"),
    sort_order: int = Query(1, description="Sort order: 1 for ascending, -1 for descending"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(30, description="Number of products per page")
):
    return await ProductService.get_products(category, min_price, max_price, sort_by, sort_order, page, limit)
@router.get("/products/search")
async def search_products_route(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(30, description="Number of products per page")
):
    """Search products by name or description"""
    return await ProductService.search_products(q, page, limit)

@router.get("/products/{product_id}")
async def get_product_details(product_id: str = Path(..., description="The ID of the product to view")):

    product = await ProductService.get_product_by_id(product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@router.get("/categories")
async def get_categories():
    """Get all available product categories"""
    return await ProductService.get_categories()

@router.get("/categories/{category}")
async def get_products_by_category(
    category: str = Path(..., description="Category name"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(30, description="Number of products per page")
):
    """Get products by specific category"""
    products = await ProductService.get_product_by_category(category, page, limit)
    if not products:
        raise HTTPException(status_code=404, detail=f"No products found in category: {category}")
    return products

