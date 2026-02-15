"""
Main PDF processing orchestrator.

Coordinates the pipeline: download → extract → chunk → embed → store.
"""

import logging
from typing import Any

from app.core.supabase import get_supabase
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class DocumentProcessingError(Exception):
    """Raised when document processing fails at any stage."""
    pass


async def process_pdf_document(file_id: str) -> None:
    """
    Process a PDF document through the full ingestion pipeline.
    
    Pipeline stages:
      1. Fetch file metadata from database
      2. Download PDF from Supabase Storage
      3. Extract text and metadata
      4. Chunk the text into semantic segments
      5. Generate embeddings for each chunk
      6. Store chunks and embeddings in vector database
      7. Update file status to 'processed'
    
    If any stage fails, update status to 'failed' and raise exception.
    
    Args:
        file_id: UUID of the file record in the database
        
    Raises:
        DocumentProcessingError: If any processing stage fails
    """
    supabase = get_supabase()
    settings = get_settings()
    
    try:
        # ── Stage 1: Fetch file metadata ─────────────────────────────────
        logger.info(f"[{file_id}] Fetching file metadata")
        
        result = supabase.table("files").select(
            "id, storage_path, original_name, user_id"
        ).eq("id", file_id).maybe_single().execute()
        
        if not result.data:
            raise DocumentProcessingError(f"File {file_id} not found in database")
        
        file_data = result.data
        storage_path = file_data["storage_path"]
        
        # Update status to 'processing'
        supabase.table("files").update(
            {"status": "processing"}
        ).eq("id", file_id).execute()
        
        # ── Stage 2: Download PDF from storage ───────────────────────────
        logger.info(f"[{file_id}] Downloading PDF from storage: {storage_path}")
        
        pdf_bytes = download_pdf_from_storage(storage_path)
        
        # Todo - rest of processing here
        
        # ── Stage X: Mark as processed ───────────────────────────────────
        logger.info(f"[{file_id}] Processing complete")
        
        supabase.table("files").update(
            {
                "status": "processed",
                "processed_at": "now()",
            }
        ).eq("id", file_id).execute()
        
    except Exception as exc:
        logger.error(f"[{file_id}] Processing failed: {exc}", exc_info=True)
        
        # Mark as failed in database
        try:
            supabase.table("files").update(
                {
                    "status": "failed",
                    "error_message": str(exc)[:500],  # Truncate if too long
                }
            ).eq("id", file_id).execute()
        except Exception as db_exc:
            logger.error(f"[{file_id}] Failed to update status: {db_exc}")
        
        raise DocumentProcessingError(f"Processing failed: {exc}") from exc


def download_pdf_from_storage(storage_path: str) -> bytes:
    """
    Download a PDF file from Supabase Storage.
    
    Args:
        storage_path: Path to the file in storage (e.g., "user_id/file_id.pdf")
        
    Returns:
        Raw bytes of the PDF file
        
    Raises:
        DocumentProcessingError: If download fails
    """
    settings = get_settings()
    supabase = get_supabase()
    
    try:
        # Download the file bytes
        response = supabase.storage.from_(
            settings.supabase_storage_bucket
        ).download(storage_path)
        
        if not response:
            raise DocumentProcessingError(f"Failed to download: {storage_path}")
        
        return response
        
    except Exception as exc:
        raise DocumentProcessingError(
            f"Storage download failed for {storage_path}: {exc}"
        ) from exc
