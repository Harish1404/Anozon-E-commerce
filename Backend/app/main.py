from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.requests import Request
from app.routes import auth_user,secure, product_routes, admin_routes, user_routes, seller_routes, super_admin_routes, review_routes
from app.ai import ollama 
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from app.db.mongodb import connect_to_mongo, create_indexes, close_mongo_connection
from app.db.redis import connect_redis, close_redis
from app.core.logger import logger
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    await connect_redis()
    await create_indexes()
    yield
    # Shutdown: Close MongoDB Connection
    await close_mongo_connection()
    await close_redis()

app = FastAPI(lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 1. LOG THE CRASH (Critical for DevOps)
    # We log the URL path, the method (GET/POST), and the actual error
    logger.critical(f"🔥 UNHANDLED CRASH: {request.method} {request.url} | Error: {exc}", exc_info=True)
    
    # 2. Return a safe message to the user (Don't expose raw stack traces)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error. Our team has been notified."}
    )
@app.get("/")
def landing_page():
    logger.info("Landing page accessed")
    return {"Message": "Hi Harish Here is your Product Management API!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        settings.ALLOWED_ORIGIN.rstrip("/"),
        settings.ALLOWED_ORIGIN,
        settings.PREVIEW_ORIGIN,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_user.router)
app.include_router(secure.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(product_routes.router)
app.include_router(seller_routes.router)
app.include_router(review_routes.router)
app.include_router(super_admin_routes.router)
app.include_router(ollama.router)  # Ollama AI routes

