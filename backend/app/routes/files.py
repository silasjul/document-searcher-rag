"""
File upload flow:

  1. POST /files/initiate-upload   — Reserve DB rows + get signed upload URLs
  2. POST /files/confirm-upload    — Mark files as "uploaded" after the client
                                     finishes uploading directly to Supabase Storage
"""

from pathlib import PurePosixPath
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.core.supabase import get_supabase
from app.core.auth import get_current_user_id

router = APIRouter(prefix="/files", tags=["files"])


# ── Request / Response schemas ───────────────────────────────────────────────


class FileEntry(BaseModel):
    """One file the client intends to upload."""
    name: str
    size: int           # bytes — useful for future validation
    mime_type: str = "application/pdf"


class InitiateUploadRequest(BaseModel):
    files: list[FileEntry]
    is_global: bool = False


class SignedUploadTarget(BaseModel):
    """Returned for each file so the client can upload via the Supabase JS client."""
    file_id: str
    storage_path: str
    token: str


class InitiateUploadResponse(BaseModel):
    uploads: list[SignedUploadTarget]


class ConfirmUploadRequest(BaseModel):
    file_ids: list[str]


class ConfirmUploadResponse(BaseModel):
    confirmed: list[str]


class SignedUrlResponse(BaseModel):
    signed_url: str


# ── Routes ───────────────────────────────────────────────────────────────────


@router.post("/initiate-upload", response_model=InitiateUploadResponse)
async def initiate_upload(
    body: InitiateUploadRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Step 1 — For every file the client wants to upload:
      • Insert a row into `files` with status = 'pending_upload'
      • Generate a signed upload URL pointing at Supabase Storage
      • Return the list so the frontend can upload directly.
    """
    if not body.files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided",
        )

    settings = get_settings()
    supabase = get_supabase()
    uploads: list[SignedUploadTarget] = []

    # Insert with a placeholder storage_path — we'll update it with the
    # real UUID-based path once we know each row's generated id.
    rows = [
        {
            "user_id": user_id,
            "original_name": f.name,
            "storage_path": "__pending__",
            "file_size": f.size,
            "mime_type": f.mime_type,
            "status": "pending_upload",
            "is_global": body.is_global,
        }
        for f in body.files
    ]

    result = supabase.table("files").insert(rows).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create file records",
        )

    # Build safe storage paths and generate signed upload URLs
    for row, file_entry in zip(result.data, body.files):
        file_id = row["id"]
        suffix = PurePosixPath(file_entry.name).suffix or ".pdf"
        storage_path = f"{user_id}/{file_id}{suffix}"

        # Persist the real storage path
        supabase.table("files").update(
            {"storage_path": storage_path}
        ).eq("id", file_id).execute()

        signed = supabase.storage.from_(
            settings.supabase_storage_bucket
        ).create_signed_upload_url(storage_path)

        uploads.append(
            SignedUploadTarget(
                file_id=file_id,
                storage_path=storage_path,
                token=signed["token"],
            )
        )

    return InitiateUploadResponse(uploads=uploads)


@router.post("/confirm-upload", response_model=ConfirmUploadResponse)
async def confirm_upload(
    body: ConfirmUploadRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Step 3 — Called *after* the frontend has PUT every file to its signed URL.
    Flips the status from 'pending_upload' → 'uploaded' so downstream
    workers know the bytes are ready.
    """
    if not body.file_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file IDs provided",
        )

    supabase = get_supabase()

    # Only update rows that belong to this user and are still pending
    result = (
        supabase.table("files")
        .update({"status": "uploaded"})
        .in_("id", body.file_ids)
        .eq("user_id", user_id)
        .eq("status", "pending_upload")
        .execute()
    )

    confirmed_ids = [row["id"] for row in (result.data or [])]
    return ConfirmUploadResponse(confirmed=confirmed_ids)


@router.get("/{file_id}/signed-url", response_model=SignedUrlResponse)
async def get_signed_url(
    file_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate a short-lived signed URL for viewing/downloading a file.
    Uses the service-role client so RLS on storage doesn't block reads.
    """
    settings = get_settings()
    supabase = get_supabase()

    # Look up the file, ensuring it belongs to the requesting user
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

    try:
        signed = supabase.storage.from_(
            settings.supabase_storage_bucket
        ).create_signed_url(storage_path, 3600)  # 1 hour
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage error: {exc}",
        )

    signed_url = signed.get("signedURL") or signed.get("signedUrl")
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate signed URL",
        )

    return SignedUrlResponse(signed_url=signed_url)
