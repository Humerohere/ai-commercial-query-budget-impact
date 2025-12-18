"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application settings
    app_env: str = "development"
    port: int = 8000
    
    # Database settings
    mongodb_uri: str
    
    # JWT settings
    jwt_secret: str
    jwt_expires_in: int = 86400  # 24 hours in seconds
    
    # CORS settings
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()