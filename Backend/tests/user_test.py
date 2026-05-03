import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from fastapi import HTTPException
from pymongo.errors import PyMongoError

from app.services.user_service import UserService


VALID_USER_ID = str(ObjectId())
VALID_PRODUCT_ID = str(ObjectId())


# -------------------------------
# toggle_favorite tests
# -------------------------------

@pytest.mark.parametrize(
    "user_id,product_id,cart,expected_message,expected_favorite",
    [
        (
            VALID_USER_ID,
            VALID_PRODUCT_ID,
            {"_id": ObjectId(), "wishlist": []},
            "Added to wishlist",
            True,
        ),
        (
            VALID_USER_ID,
            VALID_PRODUCT_ID,
            {"_id": ObjectId(), "wishlist": [{"product_id": VALID_PRODUCT_ID}]},
            "Removed from wishlist",
            False,
        ),
    ],
    ids=[
        "happy-add-to-empty-wishlist",
        "happy-remove-existing-from-wishlist",
    ],
)
@pytest.mark.asyncio
async def test_toggle_favorite_happy(user_id, product_id, cart, expected_message, expected_favorite):
    
    # Arrange
    mock_cart_collection = AsyncMock()
    # patch imported helpers/products_collection so no real DB used
    with patch("app.services.user_service.get_cart_by_user", return_value=cart) as mock_get_cart, \
         patch("app.services.user_service.update_user_wishlist", new_callable=AsyncMock) as mock_update_wishlist, \
         patch("app.services.user_service.update_product_likes", new_callable=AsyncMock) as mock_update_likes, \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col = MagicMock()
        mock_products_col_factory.return_value = mock_products_col

        
        # Act
        result = await UserService.toggle_favorite(user_id, product_id, mock_cart_collection)

        
        # Assert
        mock_get_cart.assert_awaited_once_with(mock_cart_collection, user_id)
        if expected_favorite:
            mock_update_wishlist.assert_awaited_once_with(mock_cart_collection, user_id, product_id, "add")
            mock_update_likes.assert_awaited_once_with(mock_products_col, product_id, user_id, action="like")
        else:
            mock_update_wishlist.assert_awaited_once_with(mock_cart_collection, user_id, product_id, "remove")
            mock_update_likes.assert_awaited_once_with(mock_products_col, product_id, user_id, action="unlike")

        assert result == {"message": expected_message, "is_favorite": expected_favorite}


@pytest.mark.parametrize(
    "user_id,product_id",
    [
        ("invalid", VALID_PRODUCT_ID),
        (VALID_USER_ID, "invalid"),
        ("invalid", "invalid"),
    ],
    ids=[
        "error-invalid-user-id",
        "error-invalid-product-id",
        "error-both-invalid-ids",
    ],
)
@pytest.mark.asyncio
async def test_toggle_favorite_invalid_ids(user_id, product_id):
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.toggle_favorite(user_id, product_id, AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid ID format"


@pytest.mark.asyncio
async def test_toggle_favorite_cart_not_found():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.get_cart_by_user", return_value=None) as mock_get_cart:
        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.toggle_favorite(VALID_USER_ID, VALID_PRODUCT_ID, mock_cart_collection)

        
        # Assert
        mock_get_cart.assert_awaited_once_with(mock_cart_collection, VALID_USER_ID)
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Cart/Wishlist not found"


@pytest.mark.parametrize(
    "in_wishlist,action",
    [
        (True, "unlike"),
        (False, "like"),
    ],
    ids=[
        "error-db-during-remove",
        "error-db-during-add",
    ],
)
@pytest.mark.asyncio
async def test_toggle_favorite_db_error(in_wishlist, action):
    
    # Arrange
    wishlist = [{"product_id": VALID_PRODUCT_ID}] if in_wishlist else []
    cart = {"_id": ObjectId(), "wishlist": wishlist}
    mock_cart_collection = AsyncMock()

    with patch("app.services.user_service.get_cart_by_user", return_value=cart), \
         patch("app.services.user_service.update_user_wishlist", new_callable=AsyncMock) as mock_update_wishlist, \
         patch("app.services.user_service.update_product_likes", new_callable=AsyncMock) as mock_update_likes, \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col = MagicMock()
        mock_products_col_factory.return_value = mock_products_col
        mock_update_likes.side_effect = PyMongoError("db error")

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.toggle_favorite(VALID_USER_ID, VALID_PRODUCT_ID, mock_cart_collection)

        
        # Assert
        mock_update_wishlist.assert_awaited_once()
        mock_update_likes.assert_awaited_once()
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Database update failed"


# -------------------------------
# get_wishlist tests
# -------------------------------

@pytest.mark.parametrize(
    "user_id,cart,expected",
    [
        (VALID_USER_ID, {"wishlist": [{"product_id": "p1"}, {"product_id": "p2"}]}, [{"product_id": "p1"}, {"product_id": "p2"}]),
        (VALID_USER_ID, {"items": []}, []),
        (VALID_USER_ID, None, []),
    ],
    ids=[
        "happy-with-wishlist-items",
        "happy-without-wishlist-key",
        "happy-no-cart",
    ],
)
@pytest.mark.asyncio
async def test_get_wishlist_happy_and_edge(user_id, cart, expected):
    
    # Arrange
    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.get_cart_by_user", return_value=cart) as mock_get_cart:
        
        # Act
        result = await UserService.get_wishlist(user_id, mock_cart_collection)

        
        # Assert
        mock_get_cart.assert_awaited_once_with(mock_cart_collection, user_id)
        assert result == expected


@pytest.mark.asyncio
async def test_get_wishlist_invalid_user_id():
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.get_wishlist("invalid", AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid user ID"


# -------------------------------
# add_to_cart tests
# -------------------------------

@pytest.mark.parametrize(
    "quantity,current_items,stock,expected_item_count,subtotal_expected",
    [
        (1, [], 10, 1, 100.0),
        (2, [{"product_id": VALID_PRODUCT_ID, "quantity": 1}], 10, 1, 300.0),
        (3, [], 3, 1, 300.0),
    ],
    ids=[
        "happy-add-new-item",
        "happy-increase-existing-item",
        "happy-add-up-to-stock-limit",
    ],
)
@pytest.mark.asyncio
async def test_add_to_cart_happy(quantity, current_items, stock, expected_item_count, subtotal_expected):
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Test Product",
        "price": 100.0,
        "stock": stock,
        "is_active": True,
        "is_approved": True,
        "image_urls": ["img.jpg"],
    }
    cart = {"_id": ObjectId(), "user_id": VALID_USER_ID, "items": current_items, "wishlist": []}
    mongo_result = MagicMock(modified_count=1, upserted_id=None, matched_count=1)

    with patch("app.services.user_service.fetch_product_by_id", side_effect=[product, product]), \
         patch("app.services.user_service.get_cart_by_user", side_effect=[cart, cart]), \
         patch("app.services.user_service.add_item_to_cart", return_value=mongo_result) as mock_add_item, \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col = MagicMock()
        mock_products_col_factory.return_value = mock_products_col

        
        # Act
        result = await UserService.add_to_cart(VALID_USER_ID, VALID_PRODUCT_ID, quantity, mock_cart_collection)

        
        # Assert
        mock_add_item.assert_awaited_once_with(mock_cart_collection, VALID_USER_ID, VALID_PRODUCT_ID, quantity)
        assert result["user_id"] == VALID_USER_ID
        assert len(result["items"]) == expected_item_count
        assert pytest.approx(result["summary"]["subtotal"]) == subtotal_expected


@pytest.mark.parametrize(
    "quantity",
    [
        0,
        -1,
    ],
    ids=[
        "error-quantity-zero",
        "error-quantity-negative",
    ],
)
@pytest.mark.asyncio
async def test_add_to_cart_invalid_quantity(quantity):
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.add_to_cart(VALID_USER_ID, VALID_PRODUCT_ID, quantity, AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Quantity must be positive"


@pytest.mark.parametrize(
    "user_id,product_id",
    [
        ("invalid", VALID_PRODUCT_ID),
        (VALID_USER_ID, "invalid"),
        ("invalid", "invalid"),
    ],
    ids=[
        "error-add-to-cart-invalid-user-id",
        "error-add-to-cart-invalid-product-id",
        "error-add-to-cart-both-invalid",
    ],
)
@pytest.mark.asyncio
async def test_add_to_cart_invalid_ids(user_id, product_id):
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.add_to_cart(user_id, product_id, 1, AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid ID"


@pytest.mark.asyncio
async def test_add_to_cart_product_not_found():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.fetch_product_by_id", return_value=None), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.add_to_cart(VALID_USER_ID, VALID_PRODUCT_ID, 1, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Product not found"


@pytest.mark.parametrize(
    "current_qty,quantity,stock,available",
    [
        (0, 5, 3, -2),
        (2, 2, 3, -1),
    ],
    ids=[
        "error-add-more-than-stock-no-existing",
        "error-add-more-than-stock-with-existing",
    ],
)
@pytest.mark.asyncio
async def test_add_to_cart_exceeds_stock(current_qty, quantity, stock, available):
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Test Product",
        "price": 100.0,
        "stock": stock,
        "is_active": True,
        "is_approved": True,
    }
    cart_items = []
    if current_qty > 0:
        cart_items.append({"product_id": VALID_PRODUCT_ID, "quantity": current_qty})
    cart = {"_id": ObjectId(), "user_id": VALID_USER_ID, "items": cart_items}

    with patch("app.services.user_service.fetch_product_by_id", return_value=product), \
         patch("app.services.user_service.get_cart_by_user", return_value=cart), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.add_to_cart(VALID_USER_ID, VALID_PRODUCT_ID, quantity, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 400
        assert "Cannot add" in exc_info.value.detail
        assert str(available) in exc_info.value.detail


@pytest.mark.asyncio
async def test_add_to_cart_db_error_on_add_item():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Test Product",
        "price": 100.0,
        "stock": 10,
        "is_active": True,
        "is_approved": True,
    }
    cart = {"_id": ObjectId(), "user_id": VALID_USER_ID, "items": []}

    with patch("app.services.user_service.fetch_product_by_id", side_effect=[product, product]), \
         patch("app.services.user_service.get_cart_by_user", side_effect=[cart, cart]), \
         patch("app.services.user_service.add_item_to_cart", side_effect=PyMongoError("db error")), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.add_to_cart(VALID_USER_ID, VALID_PRODUCT_ID, 1, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Database update failed"


@pytest.mark.asyncio
async def test_add_to_cart_failed_update_cart():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Test Product",
        "price": 100.0,
        "stock": 10,
        "is_active": True,
        "is_approved": True,
    }
    cart = {"_id": ObjectId(), "user_id": VALID_USER_ID, "items": []}
    mongo_result = MagicMock(modified_count=0, upserted_id=None, matched_count=0)

    with patch("app.services.user_service.fetch_product_by_id", side_effect=[product, product]), \
         patch("app.services.user_service.get_cart_by_user", side_effect=[cart, cart]), \
         patch("app.services.user_service.add_item_to_cart", return_value=mongo_result), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.add_to_cart(VALID_USER_ID, VALID_PRODUCT_ID, 1, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Failed to update cart"


# -------------------------------
# remove_from_cart tests
# -------------------------------

@pytest.mark.asyncio
async def test_remove_from_cart_happy():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    result_obj = MagicMock(modified_count=1)
    cart_after = {
        "_id": ObjectId(),
        "user_id": VALID_USER_ID,
        "items": [],
        "wishlist": [],
    }

    with patch("app.services.user_service.remove_item_from_cart", return_value=result_obj) as mock_remove, \
         patch("app.services.user_service.get_cart_by_user", return_value=cart_after), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        result = await UserService.remove_from_cart(VALID_USER_ID, VALID_PRODUCT_ID, mock_cart_collection)

        
        # Assert
        mock_remove.assert_awaited_once_with(mock_cart_collection, VALID_USER_ID, VALID_PRODUCT_ID)
        assert result["user_id"] == VALID_USER_ID
        assert result["items"] == []


@pytest.mark.asyncio
async def test_remove_from_cart_invalid_user_id():
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.remove_from_cart("invalid", VALID_PRODUCT_ID, AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid user ID"


@pytest.mark.asyncio
async def test_remove_from_cart_db_error():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.remove_item_from_cart", side_effect=PyMongoError("db error")):
        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.remove_from_cart(VALID_USER_ID, VALID_PRODUCT_ID, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Database update failed"


@pytest.mark.asyncio
async def test_remove_from_cart_product_not_found_in_cart():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    result_obj = MagicMock(modified_count=0)
    with patch("app.services.user_service.remove_item_from_cart", return_value=result_obj):
        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.remove_from_cart(VALID_USER_ID, VALID_PRODUCT_ID, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Product not found in cart"


# -------------------------------
# update_cart_quantity tests
# -------------------------------

@pytest.mark.parametrize(
    "quantity,stock",
    [
        (1, 5),
        (5, 5),
    ],
    ids=[
        "happy-update-less-than-stock",
        "happy-update-equal-stock",
    ],
)
@pytest.mark.asyncio
async def test_update_cart_quantity_happy(quantity, stock):
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Prod",
        "price": 100.0,
        "stock": stock,
        "is_active": True,
        "is_approved": True,
        "image_urls": ["img.jpg"],
    }
    cart = {
        "_id": ObjectId(),
        "user_id": VALID_USER_ID,
        "items": [{"product_id": VALID_PRODUCT_ID, "quantity": quantity}],
        "wishlist": [],
    }
    result_obj = MagicMock(modified_count=1)

    with patch("app.services.user_service.fetch_product_by_id", side_effect=[product, product]), \
         patch("app.services.user_service.update_item_quantity", return_value=result_obj) as mock_update_qty, \
         patch("app.services.user_service.get_cart_by_user", return_value=cart), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        result = await UserService.update_cart_quantity(VALID_USER_ID, VALID_PRODUCT_ID, quantity, mock_cart_collection)

        
        # Assert
        mock_update_qty.assert_awaited_once_with(mock_cart_collection, VALID_USER_ID, VALID_PRODUCT_ID, quantity)
        assert result["summary"]["subtotal"] == 100.0 * quantity


@pytest.mark.parametrize(
    "quantity",
    [
        0,
        -5,
    ],
    ids=[
        "error-update-quantity-zero",
        "error-update-quantity-negative",
    ],
)
@pytest.mark.asyncio
async def test_update_cart_quantity_invalid_quantity(quantity):
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.update_cart_quantity(VALID_USER_ID, VALID_PRODUCT_ID, quantity, AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Quantity must be greater than zero"


@pytest.mark.parametrize(
    "user_id,product_id",
    [
        ("invalid", VALID_PRODUCT_ID),
        (VALID_USER_ID, "invalid"),
        ("invalid", "invalid"),
    ],
    ids=[
        "error-update-invalid-user-id",
        "error-update-invalid-product-id",
        "error-update-both-invalid",
    ],
)
@pytest.mark.asyncio
async def test_update_cart_quantity_invalid_ids(user_id, product_id):
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.update_cart_quantity(user_id, product_id, 1, AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid ID"


@pytest.mark.asyncio
async def test_update_cart_quantity_product_not_found():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.fetch_product_by_id", return_value=None), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.update_cart_quantity(VALID_USER_ID, VALID_PRODUCT_ID, 1, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Product not found"


@pytest.mark.asyncio
async def test_update_cart_quantity_exceeds_stock():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Prod",
        "price": 100.0,
        "stock": 3,
        "is_active": True,
        "is_approved": True,
    }
    with patch("app.services.user_service.fetch_product_by_id", return_value=product), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.update_cart_quantity(VALID_USER_ID, VALID_PRODUCT_ID, 5, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 400
        assert "Cannot update to 5 items." in exc_info.value.detail


@pytest.mark.asyncio
async def test_update_cart_quantity_db_error():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Prod",
        "price": 100.0,
        "stock": 10,
        "is_active": True,
        "is_approved": True,
    }
    with patch("app.services.user_service.fetch_product_by_id", side_effect=[product, product]), \
         patch("app.services.user_service.update_item_quantity", side_effect=PyMongoError("db error")), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.update_cart_quantity(VALID_USER_ID, VALID_PRODUCT_ID, 2, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Database update failed"


@pytest.mark.asyncio
async def test_update_cart_quantity_product_not_in_cart():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    product = {
        "_id": ObjectId(VALID_PRODUCT_ID),
        "name": "Prod",
        "price": 100.0,
        "stock": 10,
        "is_active": True,
        "is_approved": True,
    }
    result_obj = MagicMock(modified_count=0)
    with patch("app.services.user_service.fetch_product_by_id", side_effect=[product, product]), \
         patch("app.services.user_service.update_item_quantity", return_value=result_obj), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.update_cart_quantity(VALID_USER_ID, VALID_PRODUCT_ID, 1, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Product not found in cart"


# -------------------------------
# get_cart tests
# -------------------------------

@pytest.mark.asyncio
async def test_get_cart_happy():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    cart = {
        "_id": ObjectId(),
        "user_id": VALID_USER_ID,
        "items": [],
        "wishlist": [],
    }
    with patch("app.services.user_service.get_cart_by_user", return_value=cart), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        result = await UserService.get_cart(VALID_USER_ID, mock_cart_collection)

        
        # Assert
        assert result["user_id"] == VALID_USER_ID
        assert result["items"] == []


@pytest.mark.asyncio
async def test_get_cart_invalid_user_id():
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.get_cart("invalid", AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid user ID"


# -------------------------------
# get_calculated_cart tests
# -------------------------------

@pytest.mark.parametrize(
    "cart_items,products,expected_subtotal,expected_delivery,expected_free_delivery",
    [
        (
            [],
            [],
            0.0,
            0.0,
            False,
        ),
        (
            [{"product_id": VALID_PRODUCT_ID, "quantity": 2}],
            [
                {
                    "_id": ObjectId(VALID_PRODUCT_ID),
                    "name": "Prod1",
                    "price": 100.0,
                    "is_active": True,
                    "is_approved": True,
                    "image_urls": ["img1.jpg"],
                }
            ],
            200.0,
            50.0,
            False,
        ),
        (
            [{"product_id": VALID_PRODUCT_ID, "quantity": 5}],
            [
                {
                    "_id": ObjectId(VALID_PRODUCT_ID),
                    "name": "Prod2",
                    "price": 120.0,
                    "is_active": True,
                    "is_approved": True,
                    "image_urls": ["img2.jpg"],
                }
            ],
            600.0,
            0.0,
            True,
        ),
    ],
    ids=[
        "edge-empty-cart",
        "happy-subtotal-below-free-delivery",
        "happy-subtotal-above-free-delivery",
    ],
)
@pytest.mark.asyncio
async def test_get_calculated_cart_items_and_summary(cart_items, products, expected_subtotal, expected_delivery, expected_free_delivery):
    
    # Arrange
    cart = {
        "_id": ObjectId(),
        "user_id": VALID_USER_ID,
        "items": cart_items,
        "wishlist": [],
        "updated_at": "2024-01-01T00:00:00Z",
    }

    async def fetch_side_effect(collection, product_id, only_approved=True):
        for p in products:
            if str(p["_id"]) == str(product_id):
                return p
        return None

    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.get_cart_by_user", return_value=cart), \
         patch("app.services.user_service.fetch_product_by_id", side_effect=fetch_side_effect), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        result = await UserService.get_calculated_cart(VALID_USER_ID, mock_cart_collection)

        
        # Assert
        assert result["user_id"] == VALID_USER_ID
        assert result["_id"] is not None
        assert result["summary"]["subtotal"] == pytest.approx(expected_subtotal)
        assert result["summary"]["delivery_charge"] == expected_delivery
        assert result["summary"]["free_delivery_eligible"] == expected_free_delivery


@pytest.mark.asyncio
async def test_get_calculated_cart_unavailable_product_and_wishlist_items():
    
    # Arrange
    unavailable_product_id = str(ObjectId())
    available_product_id = str(ObjectId())
    cart = {
        "_id": ObjectId(),
        "user_id": VALID_USER_ID,
        "items": [
            {"product_id": unavailable_product_id, "quantity": 2},
            {"product_id": available_product_id, "quantity": 1},
        ],
        "wishlist": [
            {"product_id": available_product_id, "added_at": "2024-01-02T00:00:00Z"},
        ],
        "updated_at": "2024-01-01T00:00:00Z",
    }

    products = {
        unavailable_product_id: {
            "_id": ObjectId(unavailable_product_id),
            "name": "Unavailable",
            "price": 50.0,
            "is_active": False,
            "is_approved": False,
            "image_urls": ["u.jpg"],
        },
        available_product_id: {
            "_id": ObjectId(available_product_id),
            "name": "Available",
            "price": 200.0,
            "is_active": True,
            "is_approved": True,
            "image_urls": ["a.jpg"],
        },
    }

    async def fetch_side_effect(collection, product_id, only_approved=True):
        return products.get(str(product_id))

    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.get_cart_by_user", return_value=cart), \
         patch("app.services.user_service.fetch_product_by_id", side_effect=fetch_side_effect), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        result = await UserService.get_calculated_cart(VALID_USER_ID, mock_cart_collection)

        
        # Assert
        assert len(result["items"]) == 2
        # unavailable product contributes 0
        assert result["summary"]["subtotal"] == pytest.approx(200.0)
        assert len(result["wishlist"]) == 1
        assert result["wishlist"][0]["name"] == "Available"


@pytest.mark.asyncio
async def test_get_calculated_cart_no_cart():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    with patch("app.services.user_service.get_cart_by_user", return_value=None), \
         patch("app.services.user_service.products_collection") as mock_products_col_factory:

        mock_products_col_factory.return_value = MagicMock()

        
        # Act
        result = await UserService.get_calculated_cart(VALID_USER_ID, mock_cart_collection)

        
        # Assert
        assert result["_id"] is None
        assert result["items"] == []
        assert result["wishlist"] == []
        assert result["summary"]["subtotal"] == 0.0
        assert result["summary"]["delivery_charge"] == 0.0
        assert result["updated_at"] is None


# -------------------------------
# clear_cart tests
# -------------------------------

@pytest.mark.asyncio
async def test_clear_cart_happy():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    result_obj = MagicMock(matched_count=1)
    with patch("app.services.user_service.clear_user_cart", return_value=result_obj) as mock_clear:
        
        # Act
        result = await UserService.clear_cart(VALID_USER_ID, mock_cart_collection)

        
        # Assert
        mock_clear.assert_awaited_once_with(mock_cart_collection, VALID_USER_ID)
        assert result == {"message": "Cart cleared successfully"}


@pytest.mark.asyncio
async def test_clear_cart_invalid_user_id():
    
    # Act
    with pytest.raises(HTTPException) as exc_info:
        await UserService.clear_cart("invalid", AsyncMock())

    
    # Assert
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid user ID"


@pytest.mark.asyncio
async def test_clear_cart_not_found():
    
    # Arrange
    mock_cart_collection = AsyncMock()
    result_obj = MagicMock(matched_count=0)
    with patch("app.services.user_service.clear_user_cart", return_value=result_obj):
        
        # Act
        with pytest.raises(HTTPException) as exc_info:
            await UserService.clear_cart(VALID_USER_ID, mock_cart_collection)

        
        # Assert
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Cart not found for user"
