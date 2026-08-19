import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Portfolio Generator API"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Supabase config
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str

    # Gemini Config
    GEMINI_API_KEY: Optional[str] = None

    # Qwen Config
    QWEN_API_KEY: Optional[str] = "mock-qwen-key"

    # Groq Config
    GROQ_API_KEY: Optional[str] = "mock-groq-key"

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "https://primefolio-zeta.vercel.app"]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
