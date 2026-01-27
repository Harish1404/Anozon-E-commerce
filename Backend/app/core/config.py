from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    MONGO_URL: str = os.getenv("MONGO_URL")
    DB_NAME: str = os.getenv("DB_NAME")
    JWT_SECRET: str = os.getenv("JWT_SECRET")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

settings = Settings()
