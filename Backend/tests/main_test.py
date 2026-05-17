import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse

from app.main import app, lifespan, global_exception_handler


# -------------------------------
# Lifespan tests (startup/shutdown)
# -------------------------------

@pytest.mark.asyncio
async def test_lifespan_calls_startup_and_shutdown_functions():
    
    # Arrange
    with patch("app.main.connect_to_mongo", new_callable=AsyncMock) as mock_connect_mongo, \
         patch("app.main.connect_redis", new_callable=AsyncMock) as mock_connect_redis, \
         patch("app.main.create_indexes", new_callable=AsyncMock) as mock_create_indexes, \
         patch("app.main.close_mongo_connection", new_callable=AsyncMock) as mock_close_mongo, \
         patch("app.main.close_redis", new_callable=AsyncMock) as mock_close_redis:

        
        # Act
        async with lifespan(app):
            # Inside lifespan context (startup completed, shutdown not yet)
            mock_connect_mongo.assert_awaited_once()
            mock_connect_redis.assert_awaited_once()
            mock_create_indexes.assert_awaited_once()
            mock_close_mongo.assert_not_awaited()
            mock_close_redis.assert_not_awaited()

        # After exiting context (shutdown completed)

        
        # Assert
        mock_close_mongo.assert_awaited_once()
        mock_close_redis.assert_awaited_once()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "startup_side_effect,shutdown_side_effect,expected_exception",
    [
        (Exception("startup-fail"), None, Exception),
        (None, Exception("shutdown-fail"), Exception),
    ],
    ids=[
        "error-startup-raises",
        "error-shutdown-raises",
    ],
)
async def test_lifespan_error_paths(startup_side_effect, shutdown_side_effect, expected_exception):
    
    # Arrange
    with patch("app.main.connect_to_mongo", new_callable=AsyncMock) as mock_connect_mongo, \
         patch("app.main.connect_redis", new_callable=AsyncMock) as mock_connect_redis, \
         patch("app.main.create_indexes", new_callable=AsyncMock) as mock_create_indexes, \
         patch("app.main.close_mongo_connection", new_callable=AsyncMock) as mock_close_mongo, \
         patch("app.main.close_redis", new_callable=AsyncMock) as mock_close_redis:

        if startup_side_effect:
            mock_connect_mongo.side_effect = startup_side_effect
        if shutdown_side_effect:
            mock_close_mongo.side_effect = shutdown_side_effect

        
        # Act
        if startup_side_effect:
            with pytest.raises(expected_exception):
                async with lifespan(app):
                    pass
        else:
            with pytest.raises(expected_exception):
                async with lifespan(app):
                    pass

        
        # Assert
        # We only assert that the exception path is taken; exact order of calls differs by case.
        # For startup failure, shutdown functions may not be called; for shutdown failure, startup must be called.
        if startup_side_effect:
            mock_connect_mongo.assert_awaited_once()
        else:
            mock_connect_mongo.assert_awaited_once()
            mock_connect_redis.assert_awaited_once()
            mock_create_indexes.assert_awaited_once()
            mock_close_mongo.assert_awaited_once()


# -------------------------------
# global_exception_handler tests
# -------------------------------

@pytest.mark.asyncio
@pytest.mark.parametrize(
    "exc,message",
    [
        (RuntimeError("boom"), "boom"),
        (ValueError("bad value"), "bad value"),
        (Exception("generic"), "generic"),
    ],
    ids=[
        "error-runtime-error",
        "error-value-error",
        "error-generic-error",
    ],
)
async def test_global_exception_handler_logs_and_returns_500(exc, message):
    
    # Arrange
    mock_request = MagicMock(spec=Request)
    mock_request.method = "GET"
    mock_request.url = "http://testserver/crash"

    with patch("app.main.logger") as mock_logger:
        
        # Act
        response: JSONResponse = await global_exception_handler(mock_request, exc)

        
        # Assert
        mock_logger.critical.assert_called_once()
        assert response.status_code == 500
        assert response.media_type == "application/json"
        body = response.body.decode()
        assert "Internal Server Error. Our team has been notified." in body


# -------------------------------
# landing_page ("/") tests
# -------------------------------

@pytest.mark.parametrize(
    "path",
    [
        "/",
    ],
    ids=[
        "happy-root-path",
    ],
)
def test_landing_page_happy(path):
    
    # Arrange
    client = TestClient(app)

    
    # Act
    response = client.get(path)

    
    # Assert
    assert response.status_code == 200
    assert response.json() == {"Message": "Hi Harish Here is your Product Management API!"}


def test_landing_page_logs_info(caplog):
    
    # Arrange
    client = TestClient(app)
    caplog.set_level("INFO")
    
    # Act
    response = client.get("/")

    # Assert
    assert response.status_code == 200
    assert any("Landing page accessed" in rec.getMessage() for rec in caplog.records)


# -------------------------------
# health_check ("/health") tests
# -------------------------------

@pytest.mark.parametrize(
    "path",
    [
        "/health",
    ],
    ids=[
        "happy-health-path",
    ],
)
def test_health_check_happy(path):
    
    # Arrange
    client = TestClient(app)

    
    # Act
    response = client.get(path)

    
    # Assert
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# -------------------------------
# Router inclusion tests
# -------------------------------

def test_routers_are_included():
    
    # Arrange
    route_paths = {route.path for route in app.routes}

    
    # Act
    # Just collect paths; we don't know exact paths from here, but we can ensure base ones exist.
    auth_routes_present = any("/auth" in p for p in route_paths)
    product_routes_present = any("/products" in p for p in route_paths)
    health_present = "/health" in route_paths

    
    # Assert
    assert health_present is True
    # These asserts are kept a bit loose to avoid coupling to exact paths, but still confirm router inclusion.
    assert auth_routes_present is True or product_routes_present is True


# -------------------------------
# CORS middleware tests
# -------------------------------


# -------------------------------
# Global exception handler integration with app
# -------------------------------

def test_unhandled_exception_triggers_global_exception_handler():
    
    # Arrange
    local_app = FastAPI()

    @local_app.get("/crash")
    def crash():
        raise RuntimeError("boom")

    # reuse the same handler defined in app.main
    local_app.add_exception_handler(Exception, global_exception_handler)
    client = TestClient(local_app, raise_server_exceptions=False)

    
    # Act
    response = client.get("/crash")

    
    # Assert
    assert response.status_code == 500
    assert response.json() == {
        "message": "Internal Server Error. Our team has been notified."
    }
