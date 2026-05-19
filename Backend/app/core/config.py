from pydantic import  Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URL: str = Field(..., env="MONGO_URL")
    DB_NAME: str = Field(..., env="DB_NAME")
    ALLOWED_ORIGIN: str = Field("http://localhost:3000", env="ALLOWED_ORIGIN")
    PREVIEW_ORIGIN: str = Field("http://localhost:3000", env="PREVIEW_ORIGIN")

    REDIS_URL: str = Field(..., env="REDIS_URL")

    BREVO_API_KEY: str = Field(..., env="BREVO_API_KEY")
    MAIL_FROM: str = Field(..., env="MAIL_FROM")
    MAIL_FROM_APP: str = Field(..., env="MAIL_FROM_APP")

    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(15, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    OLLAMA_API_URL: str = Field(..., env="OLLAMA_API_URL")
    OLLAMA_URL: str = Field(..., env="OLLAMA_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra='ignore'


settings = Settings()
