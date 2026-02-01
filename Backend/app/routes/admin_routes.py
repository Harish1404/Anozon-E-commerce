import logging
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.time_utils import now_ist
from fastapi.security import OAuth2PasswordBearer
from app.models.product_model import *
from app.db.mongodb import  products_collection
from app.deps.auth import get_current_admin_user

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/admin", tags=["admin controls"], dependencies=[Depends(get_current_admin_user)])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ADMIN: Create Product

@router.post("/products/create_products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, collection=Depends(products_collection)):

    try:
        new_product = product.model_dump(mode="json")
        # store created time in IST as hh-mm-ss am/pm (lowercase)
        new_product["created_at"] = now_ist("%I-%M-%S %p").lower()

        result = await collection.insert_one(new_product)

        new_product["_id"] = str(result.inserted_id)

        # 5. Return the WHOLE object, not just a partial dict
        # This satisfies the ProductResponse model which needs category, description, etc.
        return new_product

    except Exception as e:
        logger.error(f"Create product Failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/product/replace_product/{product_id}", status_code=status.HTTP_200_OK)
async def replace_product(product_id: str, product: ProductUpdate, collection=Depends(products_collection)):

    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    update_data = product.model_dump(mode="json")
    # updated time in IST hh-mm-ss am/pm
    update_data["updated_at"] = now_ist("%I-%M-%S %p").lower()

    result = await collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found!!")
    
    updated_product = await collection.find_one({"_id": ObjectId(product_id)})
    updated_product["_id"] = str(updated_product["_id"]) 
    
    return {
        "message": "Product updated successfully",
        "product": updated_product
    }

@router.patch("/product/update_product/{product_id}", status_code=status.HTTP_200_OK)
async def update_product(product_id: str, product: ProductUpdate, collection=Depends(products_collection)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    update_data = {k: v for k, v in product.dict(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    # updated time in IST hh-mm-ss am/pm
    update_data["updated_at"] = now_ist("%I-%M-%S %p").lower()

    result = await collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        logger.error(f"Update Product Failed: Not Found ID {product_id}")
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@router.delete("/product/delete_product/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(product_id: str, collection=Depends(products_collection)):

    if not ObjectId.is_valid(product_id):
        logger.error(f"Delete Product Failed: Invalid ID {product_id}")
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    result = await collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        logger.error(f"Delete Product Failed: Not Found ID {product_id}")
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}