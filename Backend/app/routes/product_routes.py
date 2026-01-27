from fastapi import APIRouter, HTTPException,status, Query
from app.services.product_service import *
from app.db.mongodb import products_collection
from app.models.product_model import *
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/")
def landing_page():
    return {"Message": "Hi Harish"}

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
    return await get_products_service(category, min_price, max_price, sort_by, sort_order, page, limit)

@router.post("/products/create_products", response_model=ResponseProduct, status_code=status.HTTP_201_CREATED)
async def create_product(product: Product):
    try:
        new_product = product.dict()
        new_product["created_at"] = datetime.now().strftime("%d-%m-%Y %H:%M:%P")

        result = await products_collection.insert_one(new_product)

        return {
            "id": str(result.inserted_id),
            "name": product.name,
            "price": product.price,
            "message": "Product created successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/product/replace_product/{product_id}", status_code=status.HTTP_200_OK)
async def replace_product(product_id: str, product: UpdateProduct):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    update_data = product.dict()
    update_data["updated_at"] = datetime.now().strftime("%d-%m-%Y %H:%M %p")

    result = await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found!!")
    
    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    updated_product["_id"] = str(updated_product["_id"]) 
    
    return {
        "message": "Product updated successfully",
        "product": updated_product
    }

@router.patch("/product/update_product/{product_id}", status_code=status.HTTP_200_OK)
async def update_product(product_id: str, product: PartialUpdate):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    update_data = {k: v for k, v in product.dict(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    update_data["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    result = await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@router.delete("/product/delete_product/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}



