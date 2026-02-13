"""
Supabase client singleton.

Uses the SERVICE ROLE key so the backend can:
  - Insert rows into the files table on behalf of any authenticated user.
  - Generate signed upload URLs for the storage bucket.
"""

from supabase import create_client, Client
from app.core.config import get_settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _client
