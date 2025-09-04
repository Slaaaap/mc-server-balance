"""
Application configuration settings.

This module contains the configuration settings for the SCPI simulator 
It uses Pydantic Settings for environment variable management and validation.
"""

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # Application settings
    PROJECT_NAME: str = "SCPI Simulator API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # CORS settings
    BACKEND_CORS_ORIGINS: str = ""



    # Database settings
    DATABASE_URL: str = "postgresql://scpi_user:scpi_password@localhost:5432/scpi_simulator"
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "scpi_simulator"
    DATABASE_USER: str = "scpi_user"
    DATABASE_PASSWORD: str = "scpi_password"

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Security settings
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # SCPI calculation settings - Comète
    COMETE_PRICE_PER_SHARE: float = 250.0
    COMETE_MIN_INVESTMENT: float = 5000.0
    COMETE_ANNUAL_YIELD: float = 0.045
    COMETE_CAPITAL_APPRECIATION: float = 0.025

    # SCPI calculation settings - ActivImmo
    ACTIVIMMO_PRICE_PER_SHARE: float = 610.0
    ACTIVIMMO_MIN_INVESTMENT: float = 6100.0
    ACTIVIMMO_ANNUAL_YIELD: float = 0.055
    ACTIVIMMO_CAPITAL_APPRECIATION: float = 0.03

    # Investment duration limits
    MIN_INVESTMENT_DURATION: int = 1
    MAX_INVESTMENT_DURATION_FULL: int = 20
    MAX_INVESTMENT_DURATION_BARE: int = 12

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60

    # External services
    SENTRY_DSN: str = ""
    MONITORING_ENABLED: bool = False

    # Email settings
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    FROM_EMAIL: str = "noreply@alderan.fr"

    # File upload settings
    MAX_FILE_SIZE: int = 10485760  # 10MB
    UPLOAD_PATH: str = "/app/uploads"

    # Testing
    TEST_DATABASE_URL: str = "postgresql://test_user:test_password@localhost:5433/test_scpi_simulator"

    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL."""
        return self.DATABASE_URL

    @property
    def database_url_async(self) -> str:
        """Get asynchronous database URL."""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    @property
    def cors_origins(self) -> list[str]:
        """Get CORS origins as a list."""
        if not self.BACKEND_CORS_ORIGINS:
            if self.ENVIRONMENT == "development":
                return [
                    "http://localhost:3000",
                    "http://localhost:5173", 
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173",
                ]
            return []
        
        # Parse the comma-separated string
        origins = [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
        return origins




settings = Settings()
