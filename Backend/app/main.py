from fastapi import FastAPI
from app.routes import auth_user, product_routes,protected, bacground_email
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(auth_user.router)
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