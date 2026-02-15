"""
Google Cloud Tasks integration for enqueuing background PDF processing jobs.
"""

import json
import logging

from google.cloud import tasks_v2

from app.core.config import get_settings
from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)


def enqueue_pdf_job(file_id: str) -> None:
    """
    Create a Cloud Task that tells the worker to process a PDF.

    On success the file's status is flipped to ``'queued'`` in the database.
    If anything goes wrong the exception is re-raised so the caller can
    decide how to handle it (e.g. return an error to the client).
    """
    settings = get_settings()

    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(
        settings.gcp_project_id,
        settings.gcp_location,
        settings.gcp_queue,
    )

    worker_endpoint = f"{settings.worker_base_url}/worker/process-pdf"
    payload = {"file_id": file_id}

    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": worker_endpoint,
            "headers": {"Content-type": "application/json"},
            "body": json.dumps(payload).encode(),
        }
    }

    response = client.create_task(request={"parent": parent, "task": task})
    logger.info("Cloud Task created: %s", response.name)

    # Mark the document as queued now that the task was accepted
    supabase = get_supabase()
    supabase.table("files").update({"status": "queued"}).eq(
        "id", file_id
    ).execute()
