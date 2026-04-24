from fastapi import APIRouter, HTTPException, Query, Path
from app.services.product_service import ProductService
from app.models.product_model import *
import requests

router = APIRouter(tags=["public product routes"])

@router.get("/")
def landing_page():

    return {"Message": "Hi Harish Here is your Product Management API!"}

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

@router.get("/products/{product_id}")
async def get_product_details(product_id: str = Path(..., description="The ID of the product to view")):

    product = await ProductService.get_product_by_id(product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@router.get("ollama/ai/chat")
async def chat_with_ollama_ai(message: str = Query(..., description="Message to send to Ollama AI")):
    try:
        response = requests.post(
            "http://localhost:11434/api/v1/chat",
            json={"model": "ollama/ai", "messages": [{"role": "user", "content": message}]}
        )
        
        return response.json()
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama AI: {str(e)}")




