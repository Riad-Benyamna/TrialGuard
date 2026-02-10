"""
Configuration management for TrialGuard backend.
Handles environment variables, API key validation, and application settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # API Keys
    gemini_api_key: str

    # Optional services
    sentry_dsn: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    resend_api_key: Optional[str] = None
    redis_url: Optional[str] = None

    # Application settings
    app_name: str = "TrialGuard"
    app_version: str = "1.0.0"
    debug: bool = False

    # API Configuration
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:5173"]

    # Gemini Configuration
    # Can be overridden by GEMINI_FLASH_MODEL and GEMINI_PRO_MODEL env vars
    # If models not found, check: https://ai.google.dev/models
    gemini_flash_model: str = "gemini-3-flash"
    gemini_pro_model: str = "gemini-3-pro"
    gemini_rate_limit_rpm: int = 60  # Requests per minute
    gemini_max_retries: int = 3

    # File Upload Limits
    max_upload_size_mb: int = 50

    # Cache Settings
    cache_ttl_protocol_parsing: int = 3600  # 1 hour
    cache_ttl_risk_analysis: int = 600  # 10 minutes
    cache_ttl_drug_safety: int = 86400  # 24 hours

    # Rate Limiting
    rate_limit_per_ip: int = 10  # requests per minute

    # Database
    database_url: str = "sqlite:///./trialguard.db"

    class Config:
        env_file = ".env"
        case_sensitive = False


def get_settings() -> Settings:
    """Get application settings singleton"""
    return Settings()


# Validate Gemini API key on startup
def validate_gemini_api_key(api_key: str) -> bool:
    """
    Validate that Gemini API key is properly formatted
    Returns True if valid, raises ValueError if not
    """
    if not api_key or len(api_key) < 20:
        raise ValueError(
            "Invalid GEMINI_API_KEY. Get your API key from: "
            "https://aistudio.google.com/app/apikey"
        )
    return True


# Initialize settings
settings = get_settings()
validate_gemini_api_key(settings.gemini_api_key)
