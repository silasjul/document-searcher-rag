"""
File download endpoints — signed URLs and bulk downloads.
"""

import io
import zipfile
from pathlib import PurePosixPath

import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.config import get_settings
from app.core.supabase import get_supabase
from app.core.auth import get_current_user_id

router = APIRouter()


# ── Request / Response schemas ───────────────────────────────────────────────


class SignedUrlResponse(BaseModel):
    signed_url: str


class BulkDownloadRequest(BaseModel):
    file_ids: list[str]


# ── Routes ───────────────────────────────────────────────────────────────────


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


@router.post("/bulk-download")
async def bulk_download(
    body: BulkDownloadRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Download multiple files as a single ZIP archive.
    Fetches each file from Supabase Storage via signed URLs,
    bundles them into an in-memory ZIP, and streams it back.
    """
    if not body.file_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file IDs provided",
        )

    settings = get_settings()
    supabase = get_supabase()

    # Look up all requested files (only those belonging to this user)
    result = (
        supabase.table("files")
        .select("id, original_name, storage_path")
        .in_("id", body.file_ids)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No matching files found",
        )

    # Generate signed download URLs for each file
    files_to_download: list[dict] = []
    for row in result.data:
        storage_path = row["storage_path"]
        if not storage_path or storage_path == "__pending__":
            continue

        try:
            signed = supabase.storage.from_(
                settings.supabase_storage_bucket
            ).create_signed_url(storage_path, 300)  # 5 min

            signed_url = signed.get("signedURL") or signed.get("signedUrl")
            if signed_url:
                files_to_download.append({
                    "name": row["original_name"],
                    "url": signed_url,
                })
        except Exception as exc:
            print(f"Warning: failed to get signed URL for {row['id']}: {exc}")

    if not files_to_download:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate download URLs for any of the requested files",
        )

    # Download each file and add to ZIP archive
    zip_buffer = io.BytesIO()

    # Track names to avoid duplicates in the ZIP
    used_names: dict[str, int] = {}

    async with httpx.AsyncClient(timeout=60.0) as client:
        for file_info in files_to_download:
            try:
                resp = await client.get(file_info["url"])
                resp.raise_for_status()

                # Deduplicate file names inside the ZIP
                name = file_info["name"]
                if name in used_names:
                    used_names[name] += 1
                    stem = PurePosixPath(name).stem
                    suffix = PurePosixPath(name).suffix
                    name = f"{stem} ({used_names[name]}){suffix}"
                else:
                    used_names[name] = 0

                with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED) as zf:
                    zf.writestr(name, resp.content)

            except Exception as exc:
                print(f"Warning: failed to download '{file_info['name']}': {exc}")

    zip_buffer.seek(0)

    if zip_buffer.getbuffer().nbytes == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download any files",
        )

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=documents.zip",
        },
    )
