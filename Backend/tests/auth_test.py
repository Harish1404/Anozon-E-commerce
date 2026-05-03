import pytest
from unittest.mock import AsyncMock, patch
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
from fastapi import HTTPException

from app.repo.auth_helpers import (
    get_user_by_email,
    generate_tokens,
    count_users,
    insert_user,
    update_user,
    delete_user,
    update_user_by_email,
)


# -------------------------------
# get_user_by_email tests
# -------------------------------

@pytest.mark.parametrize(
    "email, db_result",
    [
        ("user1@example.com", {"_id": "1", "email": "user1@example.com"}),
        ("another.user@example.org", {"_id": "2", "email": "another.user@example.org"}),
        ("UPPERCASE@EXAMPLE.COM", {"_id": "3", "email": "UPPERCASE@EXAMPLE.COM"}),
        ("weird+tag@example.co.uk", {"_id": "4", "email": "weird+tag@example.co.uk"}),
    ],
    ids=[
        "happy-basic",
        "happy-org-domain",
        "happy-uppercase",
        "happy-plus-tag",
    ],
)
@pytest.mark.asyncio
async def test_get_user_by_email_happy(email, db_result):
    # Act

    mock_collection = AsyncMock()
    mock_collection.find_one.return_value = db_result

    result = await get_user_by_email(mock_collection, email)

    # Assert

    mock_collection.find_one.assert_awaited_once_with({"email": email})
    assert result == db_result


@pytest.mark.parametrize(
    "email",
    [
        "",
        "   ",
        "no-at-symbol",
        "user@",
        "@example.com",
    ],
    ids=[
        "edge-empty-string",
        "edge-whitespace",
        "edge-no-at",
        "edge-missing-domain",
        "edge-missing-localpart",
    ],
)
@pytest.mark.asyncio
async def test_get_user_by_email_edge_cases(email):
    # Act

    mock_collection = AsyncMock()
    mock_collection.find_one.return_value = None

    result = await get_user_by_email(mock_collection, email)

    # Assert

    mock_collection.find_one.assert_awaited_once_with({"email": email})
    assert result is None


@pytest.mark.asyncio
async def test_get_user_by_email_db_error():
    # Arrange

    email = "error@example.com"
    mock_collection = AsyncMock()
    mock_collection.find_one.side_effect = PyMongoError("DB error")

    # Act

    with pytest.raises(HTTPException) as exc_info:
        await get_user_by_email(mock_collection, email)

    # Assert

    mock_collection.find_one.assert_awaited_once_with({"email": email})
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database error"


# -------------------------------
# generate_tokens tests
# -------------------------------

@pytest.mark.parametrize(
    "user_id,email,role",
    [
        ("507f1f77bcf86cd799439011", "user@example.com", "user"),
        ("000000000000000000000000", "admin@example.com", "admin"),
        ("1234567890abcdef12345678", "test+alias@example.org", "staff"),
    ],
    ids=[
        "happy-standard-user",
        "happy-admin",
        "happy-staff-with-alias",
    ],
)
@pytest.mark.asyncio
async def test_generate_tokens_happy(user_id, email, role):
    # Arrange

    with patch("app.repo.auth_helpers.create_access_token", return_value="access-token") as mock_access, \
         patch("app.repo.auth_helpers.create_refresh_token", return_value="refresh-token") as mock_refresh, \
         patch("app.repo.auth_helpers.utc_now", return_value=1234567890):

        # Act

        access_token, refresh_token = await generate_tokens(user_id, email, role, user_col=None)

        # Assert

        assert access_token == "access-token"
        assert refresh_token == "refresh-token"

        expected_payload = {
            "_id": str(user_id),
            "email": email,
            "role": role,
            "iss": "Anozon",
            "aud": "Anozon",
            "iat": 1234567890,
        }
        mock_access.assert_called_once_with(expected_payload)
        mock_refresh.assert_called_once_with(expected_payload)


@pytest.mark.parametrize(
    "user_id,email,role",
    [
        ("", "", ""),
        ("short", "no-at", "r"),
        ("507f1f77bcf86cd799439011", "caps@EXAMPLE.COM", "ROLE_WITH_UNDERSCORES"),
    ],
    ids=[
        "edge-empty-fields",
        "edge-invalid-email-short-role",
        "edge-strange-role-format",
    ],
)
@pytest.mark.asyncio
async def test_generate_tokens_edge_cases(user_id, email, role):
    # Arrange

    with patch("app.repo.auth_helpers.create_access_token", return_value="access-token") as mock_access, \
         patch("app.repo.auth_helpers.create_refresh_token", return_value="refresh-token") as mock_refresh, \
         patch("app.repo.auth_helpers.utc_now", return_value=0):

        # Act

        access_token, refresh_token = await generate_tokens(user_id, email, role, user_col=None)

        # Assert

        assert access_token == "access-token"
        assert refresh_token == "refresh-token"
        expected_payload = {
            "_id": str(user_id),
            "email": email,
            "role": role,
            "iss": "Anozon",
            "aud": "Anozon",
            "iat": 0,
        }
        mock_access.assert_called_once_with(expected_payload)
        mock_refresh.assert_called_once_with(expected_payload)


@pytest.mark.asyncio
async def test_generate_tokens_error_on_access_token():
    # Arrange

    with patch("app.repo.auth_helpers.create_access_token", side_effect=RuntimeError("fail-access")), \
         patch("app.repo.auth_helpers.create_refresh_token", return_value="refresh-token"), \
         patch("app.repo.auth_helpers.utc_now", return_value=0):

        # Act

        with pytest.raises(HTTPException) as exc_info:
            await generate_tokens("id", "user@example.com", "role", user_col=None)

        # Assert

        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Token generation failed"


@pytest.mark.asyncio
async def test_generate_tokens_error_on_refresh_token():
    # Arrange

    with patch("app.repo.auth_helpers.create_access_token", return_value="access-token"), \
         patch("app.repo.auth_helpers.create_refresh_token", side_effect=RuntimeError("fail-refresh")), \
         patch("app.repo.auth_helpers.utc_now", return_value=0):

        # Act

        with pytest.raises(HTTPException) as exc_info:
            await generate_tokens("id", "user@example.com", "role", user_col=None)

        # Assert

        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Token generation failed"


# -------------------------------
# count_users tests
# -------------------------------

@pytest.mark.parametrize(
    "db_count",
    [
        0,
        1,
        42,
        10_000,
    ],
    ids=[
        "happy-zero-users",
        "happy-single-user",
        "happy-42-users",
        "happy-many-users",
    ],
)
@pytest.mark.asyncio
async def test_count_users_happy(db_count):
    # Act

    mock_collection = AsyncMock()
    mock_collection.count_documents.return_value = db_count

    result = await count_users(mock_collection)

    # Assert

    mock_collection.count_documents.assert_awaited_once_with({})
    assert result == db_count


@pytest.mark.asyncio
async def test_count_users_db_error():
    # Arrange

    mock_collection = AsyncMock()
    mock_collection.count_documents.side_effect = PyMongoError("count error")

    # Act

    with pytest.raises(HTTPException) as exc_info:
        await count_users(mock_collection)

    # Assert

    mock_collection.count_documents.assert_awaited_once_with({})
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database error"


# -------------------------------
# insert_user tests
# -------------------------------

@pytest.mark.parametrize(
    "user_data, insert_result",
    [
        ({"email": "user@example.com", "name": "User"}, {"inserted_id": ObjectId()}),
        ({"email": "admin@example.com", "role": "admin"}, {"inserted_id": ObjectId()}),
        ({}, {"inserted_id": ObjectId()}),
    ],
    ids=[
        "happy-regular-user",
        "happy-admin-user",
        "happy-empty-data",
    ],
)
@pytest.mark.asyncio
async def test_insert_user_happy(user_data, insert_result):
    # Act

    mock_collection = AsyncMock()
    mock_collection.insert_one.return_value = insert_result

    result = await insert_user(mock_collection, user_data)

    # Assert

    mock_collection.insert_one.assert_awaited_once_with(user_data)
    assert result == insert_result


@pytest.mark.asyncio
async def test_insert_user_db_error():
    # Arrange

    mock_collection = AsyncMock()
    mock_collection.insert_one.side_effect = PyMongoError("insert error")
    user_data = {"email": "error@example.com"}

    # Act

    with pytest.raises(HTTPException) as exc_info:
        await insert_user(mock_collection, user_data)

    # Assert

    mock_collection.insert_one.assert_awaited_once_with(user_data)
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database error"


# -------------------------------
# update_user tests
# -------------------------------

@pytest.mark.parametrize(
    "user_id, update_data, update_result",
    [
        ("507f1f77bcf86cd799439011", {"name": "New Name"}, {"matched_count": 1, "modified_count": 1}),
        ("000000000000000000000000", {"role": "admin"}, {"matched_count": 0, "modified_count": 0}),
        ("1234567890abcdef12345678", {}, {"matched_count": 1, "modified_count": 0}),
    ],
    ids=[
        "happy-update-name",
        "happy-no-match",
        "happy-empty-update-data",
    ],
)
@pytest.mark.asyncio
async def test_update_user_happy(user_id, update_data, update_result):
    # Act

    mock_collection = AsyncMock()
    mock_collection.update_one.return_value = update_result

    result = await update_user(mock_collection, user_id, update_data)

    # Assert

    mock_collection.update_one.assert_awaited_once()
    call_args = mock_collection.update_one.await_args[0]
    assert call_args[0] == {"_id": ObjectId(user_id)}
    assert call_args[1] == {"$set": update_data}
    assert result == update_result


@pytest.mark.asyncio
async def test_update_user_db_error():
    # Arrange

    user_id = "507f1f77bcf86cd799439011"
    update_data = {"name": "Error Name"}
    mock_collection = AsyncMock()
    mock_collection.update_one.side_effect = PyMongoError("update error")

    # Act

    with pytest.raises(HTTPException) as exc_info:
        await update_user(mock_collection, user_id, update_data)

    # Assert

    mock_collection.update_one.assert_awaited_once()
    args = mock_collection.update_one.await_args[0]
    assert args[0] == {"_id": ObjectId(user_id)}
    assert args[1] == {"$set": update_data}
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database error"


# -------------------------------
# delete_user tests
# -------------------------------

@pytest.mark.parametrize(
    "user_id, delete_result",
    [
        ("507f1f77bcf86cd799439011", {"deleted_count": 1}),
        ("000000000000000000000000", {"deleted_count": 0}),
    ],
    ids=[
        "happy-delete-existing",
        "happy-delete-nonexistent",
    ],
)
@pytest.mark.asyncio
async def test_delete_user_happy(user_id, delete_result):
    # Act

    mock_collection = AsyncMock()
    mock_collection.delete_one.return_value = delete_result

    result = await delete_user(mock_collection, user_id)

    # Assert

    mock_collection.delete_one.assert_awaited_once()
    args = mock_collection.delete_one.await_args[0]
    assert args[0] == {"_id": ObjectId(user_id)}
    assert result == delete_result


@pytest.mark.asyncio
async def test_delete_user_db_error():
    # Arrange

    user_id = "507f1f77bcf86cd799439011"
    mock_collection = AsyncMock()
    mock_collection.delete_one.side_effect = PyMongoError("delete error")

    # Act

    with pytest.raises(HTTPException) as exc_info:
        await delete_user(mock_collection, user_id)

    # Assert

    mock_collection.delete_one.assert_awaited_once()
    args = mock_collection.delete_one.await_args[0]
    assert args[0] == {"_id": ObjectId(user_id)}
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database error"


# -------------------------------
# update_user_by_email tests
# -------------------------------

@pytest.mark.parametrize(
    "email, update_data, update_result",
    [
        ("user@example.com", {"name": "Updated"}, {"matched_count": 1, "modified_count": 1}),
        ("missing@example.com", {"name": "No Match"}, {"matched_count": 0, "modified_count": 0}),
        ("user@example.com", {}, {"matched_count": 1, "modified_count": 0}),
    ],
    ids=[
        "happy-update-existing",
        "happy-update-nonexistent",
        "happy-empty-update-data",
    ],
)
@pytest.mark.asyncio
async def test_update_user_by_email_happy(email, update_data, update_result):
    # Act

    mock_collection = AsyncMock()
    mock_collection.update_one.return_value = update_result

    result = await update_user_by_email(mock_collection, email, update_data)

    # Assert

    mock_collection.update_one.assert_awaited_once_with({"email": email}, {"$set": update_data})
    assert result == update_result


@pytest.mark.asyncio
async def test_update_user_by_email_db_error():
    # Arrange

    email = "error@example.com"
    update_data = {"name": "Error"}
    mock_collection = AsyncMock()
    mock_collection.update_one.side_effect = PyMongoError("update error")

    # Act

    with pytest.raises(HTTPException) as exc_info:
        await update_user_by_email(mock_collection, email, update_data)

    # Assert

    mock_collection.update_one.assert_awaited_once_with({"email": email}, {"$set": update_data})
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database error"


