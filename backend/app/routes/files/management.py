"""
File management endpoints — delete files and metadata.
"""

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.core.supabase import get_supabase
from app.core.auth import get_current_user_id

router = APIRouter()


# ── Request / Response schemas ───────────────────────────────────────────────


class DeleteFileResponse(BaseModel):
    deleted: bool


# ── Routes ───────────────────────────────────────────────────────────────────


@router.delete("/{file_id}", response_model=DeleteFileResponse)
async def delete_file(
    file_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Permanently delete a file:
      1. Look up the file row (ensuring ownership)
      2. Remove the object from Supabase Storage
      3. Delete junction rows (project_documents, file_tags)
      4. Delete the file record itself
    """
    settings = get_settings()
    supabase = get_supabase()

    # ── 1. Verify ownership and get storage path ─────────────────────────
    result = (
        supabase.table("files")
        .select("storage_path")
        .eq("id", file_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    storage_path = result.data["storage_path"]

    # ── 2. Remove from Supabase Storage ──────────────────────────────────
    if storage_path and storage_path != "__pending__":
        try:
            supabase.storage.from_(
                settings.supabase_storage_bucket
            ).remove([storage_path])
        except Exception as exc:
            # Log but don't block deletion — the DB record is more important
            print(f"Warning: failed to remove storage object '{storage_path}': {exc}")

    # ── 3. Delete junction rows ──────────────────────────────────────────
    supabase.table("project_documents").delete().eq("file_id", file_id).execute()
    supabase.table("file_tags").delete().eq("file_id", file_id).execute()

    # ── 4. Delete the file record ────────────────────────────────────────
    delete_result = (
        supabase.table("files")
        .delete()
        .eq("id", file_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not delete_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file record",
        )

    return DeleteFileResponse(deleted=True)
