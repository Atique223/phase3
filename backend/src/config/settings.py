"""Settings configuration for Todo API."""

import os
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database settings
    DATABASE_URL: str = "sqlite:///./todo_api.db"

    # Authentication settings
    BETTER_AUTH_SECRET: str = "fallback-test-secret-key-change-in-production"
    BETTER_AUTH_URL: str = "http://localhost:3000"

    # OpenAI settings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"

    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Todo API"

    # CORS settings for Next.js frontend
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js default port
        "http://localhost:3001",  # Alternative Next.js port
        "http://localhost:3002",  # Alternative Next.js port
        "https://localhost:3000",
        "https://localhost:3001",
        "https://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:3001",
        "https://127.0.0.1:3002",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # Add any additional origins from environment variable
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Allow additional origins from environment variable
        additional_origins = os.getenv("BACKEND_CORS_ORIGINS", "")
        if additional_origins:
            origins_list = [origin.strip() for origin in additional_origins.split(",") if origin.strip()]
            self.BACKEND_CORS_ORIGINS.extend(origins_list)

        # T049: Validate environment variables on startup
        self.validate_settings()

    def validate_settings(self):
        """Validate critical environment variables on startup."""
        errors = []
        warnings = []

        # Critical: OpenAI API key must be set
        if not self.OPENAI_API_KEY or self.OPENAI_API_KEY.strip() == "":
            errors.append("OPENAI_API_KEY is not set. AI chat functionality will not work.")

        # Warning: Using fallback auth secret in production
        if self.BETTER_AUTH_SECRET == "fallback-test-secret-key-change-in-production":
            warnings.append("BETTER_AUTH_SECRET is using fallback value. Set a secure secret in production.")

        # Warning: Using SQLite in production
        if "sqlite" in self.DATABASE_URL.lower():
            warnings.append("Using SQLite database. Consider using PostgreSQL for production.")

        # Log warnings
        for warning in warnings:
            logger.warning(f"Configuration Warning: {warning}")

        # Raise errors
        if errors:
            error_msg = "Configuration Errors:\n" + "\n".join(f"  - {err}" for err in errors)
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.info("Environment variable validation passed")


settings = Settings()