"""
Auth dependency — extracts and verifies the Supabase JWT from the
Authorization header, then returns the authenticated user_id.
"""

from fastapi import Depends, HTTPException, Request, status
from app.core.supabase import get_supabase


async def get_current_user_id(request: Request) -> str:
    """
    Validate the Bearer token by calling Supabase's auth.get_user().
    Returns the user's UUID string.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.removeprefix("Bearer ")

    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        return user_response.user.id
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
