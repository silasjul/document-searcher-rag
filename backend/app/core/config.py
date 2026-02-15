import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from functools import lru_cache

load_dotenv()


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_storage_bucket: str = "pdfs"

    # Signed URL validity in seconds (default: 5 minutes)
    upload_url_expiry: int = 300

    # Google Cloud Tasks / worker settings
    gcp_project_id: str
    gcp_location: str
    gcp_queue: str
    worker_base_url: str

    # Qdrant settings
    qdrant_url: str
    qdrant_api_key: str

    model_config = {"env_file": ".env"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
