from fastapi import FastAPI
from fastapi.responses import JSONResponse
from h11 import Request
from app.routes import auth_user, product_routes,protected, bacground_email, admin_routes, user_routes
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.core.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB Connection
    await close_mongo_connection()

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

app.include_router(auth_user.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(product_routes.router)
app.include_router(protected.router)
app.include_router(bacground_email.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)