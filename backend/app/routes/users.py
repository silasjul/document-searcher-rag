"""
User account management routes.

DELETE /users/me  — Permanently delete the authenticated user and ALL
                    associated data (storage objects, files, tags, projects,
                    chat sessions, messages, then the auth.users row).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.supabase import get_supabase
from app.core.auth import get_current_user_id

router = APIRouter(prefix="/users", tags=["users"])


class DeleteAccountResponse(BaseModel):
    detail: str


@router.delete("/me", response_model=DeleteAccountResponse)
async def delete_account(
    user_id: str = Depends(get_current_user_id),
):
    """
    Permanently delete the current user and **all** associated data:

    1. Remove every file from Supabase Storage (`pdfs` bucket)
    2. Delete DB rows in dependency order:
       file_tags → tags → messages → chat_sessions →
       project_documents → projects → files
    3. Delete the auth.users row via the Admin API
    """
    settings = get_settings()
    supabase = get_supabase()

    try:
        # ── 1. Delete storage objects ────────────────────────────────────
        # List all objects under the user's folder in the storage bucket
        try:
            objects = supabase.storage.from_(
                settings.supabase_storage_bucket
            ).list(path=user_id)

            if objects:
                paths = [f"{user_id}/{obj['name']}" for obj in objects]
                supabase.storage.from_(
                    settings.supabase_storage_bucket
                ).remove(paths)
        except Exception:
            # Storage might already be empty — continue
            pass

        # ── 2. Delete database rows (order matters for FK constraints) ───

        # file_tags (depends on files + tags)
        file_ids_result = (
            supabase.table("files")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )
        file_ids = [r["id"] for r in (file_ids_result.data or [])]

        if file_ids:
            supabase.table("file_tags").delete().in_(
                "file_id", file_ids
            ).execute()

        # tags
        supabase.table("tags").delete().eq("user_id", user_id).execute()

        # messages (via chat_sessions)
        chat_ids_result = (
            supabase.table("chat_sessions")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )
        chat_ids = [r["id"] for r in (chat_ids_result.data or [])]

        if chat_ids:
            supabase.table("messages").delete().in_(
                "chat_id", chat_ids
            ).execute()

        # chat_sessions
        supabase.table("chat_sessions").delete().eq(
            "user_id", user_id
        ).execute()

        # project_documents (via projects)
        project_ids_result = (
            supabase.table("projects")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )
        project_ids = [r["id"] for r in (project_ids_result.data or [])]

        if project_ids:
            supabase.table("project_documents").delete().in_(
                "project_id", project_ids
            ).execute()

        # projects
        supabase.table("projects").delete().eq(
            "user_id", user_id
        ).execute()

        # files
        supabase.table("files").delete().eq("user_id", user_id).execute()

        # ── 3. Delete the auth user ──────────────────────────────────────
        supabase.auth.admin.delete_user(user_id)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {exc}",
        )

    return DeleteAccountResponse(detail="Account deleted successfully")
