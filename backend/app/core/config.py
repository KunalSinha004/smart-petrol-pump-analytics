import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )

    PROJECT_NAME: str = "Smart Petrol Pump Analytics"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "sppa-super-secure-production-jwt-token-secret-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Snowflake Connection Parameters
    SNOWFLAKE_ACCOUNT: Optional[str] = os.getenv("SNOWFLAKE_ACCOUNT", "")
    SNOWFLAKE_USER: Optional[str] = os.getenv("SNOWFLAKE_USER", "")
    SNOWFLAKE_PASSWORD: Optional[str] = os.getenv("SNOWFLAKE_PASSWORD", "")
    SNOWFLAKE_DATABASE: str = os.getenv("SNOWFLAKE_DATABASE", "SMART_PETROL_DB")
    SNOWFLAKE_WAREHOUSE: str = os.getenv("SNOWFLAKE_WAREHOUSE", "SPPA_WH")
    SNOWFLAKE_ROLE: str = os.getenv("SNOWFLAKE_ROLE", "ACCOUNTADMIN")
    SNOWFLAKE_SCHEMA: str = os.getenv("SNOWFLAKE_SCHEMA", "SALES_MANAGEMENT")
    
    # Operational Mode: Force or fallback to Demo Mode if Snowflake credentials absent
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # AI / LLM Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
