from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_storage_bucket: str = "pdfs"

    # Signed URL validity in seconds (default: 5 minutes)
    upload_url_expiry: int = 300

    model_config = {"env_file": ".env"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
