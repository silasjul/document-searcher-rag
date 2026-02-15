"""
Worker endpoints — called by Google Cloud Tasks to process documents.

These endpoints are meant to be called by background workers, not by clients.
Consider adding authentication/validation to ensure only your Cloud Tasks can call them.
"""

import logging
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status

from app.services.pdf.processor import process_pdf_document

router = APIRouter(prefix="/worker", tags=["worker"])
logger = logging.getLogger(__name__)


class ProcessPdfRequest(BaseModel):
    """Payload sent by Cloud Tasks to trigger PDF processing."""
    file_id: str


class ProcessPdfResponse(BaseModel):
    """Response after processing attempt."""
    success: bool
    file_id: str
    message: str


@router.post("/process-pdf", response_model=ProcessPdfResponse)
async def process_pdf(body: ProcessPdfRequest):
    """
    Process a PDF document:
      1. Download from Supabase Storage
      2. Extract text and metadata
      3. Chunk the content
      4. Generate embeddings
      5. Store in vector database
      6. Update file status to 'processed' or 'failed'
    
    This endpoint is designed to be idempotent — if called multiple times
    with the same file_id, it should handle gracefully.
    """
    file_id = body.file_id
    
    try:
        logger.info(f"Starting PDF processing for file_id={file_id}")
        
        # Main processing pipeline
        await process_pdf_document(file_id)
        
        logger.info(f"Successfully processed file_id={file_id}")
        
        return ProcessPdfResponse(
            success=True,
            file_id=file_id,
            message="Document processed successfully"
        )
        
    except Exception as exc:
        logger.error(f"Failed to process file_id={file_id}: {exc}", exc_info=True)
        
        # Don't raise HTTP exception — Cloud Tasks will retry on 5xx
        # Instead, return 200 with success=False to acknowledge receipt
        return ProcessPdfResponse(
            success=False,
            file_id=file_id,
            message=f"Processing failed: {str(exc)}"
        )
