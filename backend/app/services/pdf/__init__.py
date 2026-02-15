"""
PDF processing service — handles document ingestion pipeline.
"""

from app.services.pdf.processor import process_pdf_document

__all__ = ["process_pdf_document"]
