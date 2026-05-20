from fastapi import APIRouter, HTTPException, Query, Path
from typing import Optional
from app.services.product_service import ProductService
from app.models.product_model import PaginatedProductResponse, ProductResponse

router = APIRouter(tags=["Public Product Routes"])

@router.get("/products", response_model=PaginatedProductResponse)
async def get_products(
    category: Optional[str] = Query(None, description="Comma separated categories"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_discount: Optional[int] = Query(None, description="Minimum discount percent"),
    min_rating: Optional[float] = Query(None, description="Minimum average rating"),
    in_stock: Optional[bool] = Query(None, description="Only show in-stock products"),
    search: Optional[str] = Query(None, description="Search query string"),
    brand: Optional[str] = Query(None, description="Comma separated brands"),
    sub_category: Optional[str] = Query(None, description="Comma separated subcategories"),
    tags: Optional[str] = Query(None, description="Comma separated tags"),
    is_featured: Optional[bool] = Query(None, description="Filter featured products"),
    sort_by: str = Query("created_at", description="Sort by field: price, avg_rating, created_at, discount_percent"),
    sort_order: int = Query(-1, description="Sort order: 1 (asc) or -1 (desc)"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(30, description="Items per page")
):
    """
    Get a paginated list of products with comprehensive filtering.
    """
    return await ProductService.get_products(
        category=category,
        min_price=min_price,
        max_price=max_price,
        min_discount=min_discount,
        min_rating=min_rating,
        in_stock=in_stock,
        search=search,
        brand=brand,
        sub_category=sub_category,
        tags=tags,
        is_featured=is_featured,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )

@router.get("/products/search", response_model=PaginatedProductResponse)
async def search_products_route(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(30, description="Number of products per page")
):
    """Search products by name or description"""
    return await ProductService.search_products(q, page, limit)

@router.get("/products/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str = Path(..., description="The slug of the product to view")):
    product = await ProductService.get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product_details(product_id: str = Path(..., description="The ID of the product to view")):
    product = await ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/categories")
async def get_categories():
    """Get all available product categories"""
    return await ProductService.get_categories()

@router.get("/categories/{category}", response_model=PaginatedProductResponse)
async def get_products_by_category(
    category: str = Path(..., description="Category name"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(30, description="Number of products per page")
):
    """Get products by specific category"""
    products_page = await ProductService.get_product_by_category(category, page, limit)
    if not products_page.items:
        raise HTTPException(status_code=404, detail=f"No products found in category: {category}")
    return products_page

