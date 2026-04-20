from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Blockradar API
    blockradar_api_key: str = ""
    blockradar_base_url: str = "https://api.blockradar.co/v1"
    blockradar_wallet_id: str = ""

    # PostgreSQL
    database_url: str = "postgresql://postgres:password@localhost:5432/blockradar_intelligence"

    # FastAPI
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    secret_key: str = "change_this"

    # Pipeline
    data_mode: str = "simulated"  # "real" or "simulated"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()