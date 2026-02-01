from pydantic import  Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URL: str = Field(..., env="MONGO_URL")
    DB_NAME: str = Field(..., env="DB_NAME")
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(15, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, env="REFRESH_TOKEN_EXPIRE_DAYS")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra='ignore'


settings = Settings()
