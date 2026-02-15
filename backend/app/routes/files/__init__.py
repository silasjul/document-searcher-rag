"""
File routes — organized into logical modules.

This module combines all file-related endpoints into a single router.
"""

from fastapi import APIRouter
from app.routes.files import upload, download, management

router = APIRouter(prefix="/files", tags=["files"])

# Include all file-related sub-routers
router.include_router(upload.router)
router.include_router(download.router)
router.include_router(management.router)
