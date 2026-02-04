"""JWT utilities for authentication in Todo API."""

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from fastapi import HTTPException, status
from pydantic import ValidationError

from ..schemas.task import TokenData


SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "fallback-test-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_token(token: str) -> Optional[TokenData]:
    """
    Verify JWT token and extract user data.

    Args:
        token: JWT token string

    Returns:
        TokenData object with user information or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract email if present
        email: str = payload.get("email")

        token_data = TokenData(user_id=user_id, email=email)
        return token_data
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token data",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_token_payload(token: str) -> dict:
    """
    Decode JWT token payload without verification (for debugging purposes).

    Args:
        token: JWT token string

    Returns:
        Decoded payload dictionary
    """
    try:
        # This decodes without verification - only use for debugging
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception:
        return {}


def validate_user_access(token_user_id: str, requested_user_id: str) -> bool:
    """
    Validate that the user in the token matches the requested user ID.

    Args:
        token_user_id: User ID from JWT token
        requested_user_id: User ID from request path/params

    Returns:
        True if user IDs match, False otherwise
    """
    return token_user_id == requested_user_id