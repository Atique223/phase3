"""Authentication dependencies for Todo API."""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .jwt_utils import verify_token
from ..schemas.task import TokenData


security = HTTPBearer()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Get current authenticated user from JWT token.

    Args:
        request: FastAPI request object
        credentials: HTTP authorization credentials from header

    Returns:
        TokenData object with user information

    Raises:
        HTTPException: If token is invalid or user is unauthorized
    """
    token = credentials.credentials
    token_data = verify_token(token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token_data


def verify_user_owns_resource(current_user: TokenData = Depends(get_current_user)):
    """
    Verify that the current user owns the resource they're trying to access.
    This is a base dependency that can be extended for specific resource validation.

    Args:
        current_user: Current authenticated user data

    Returns:
        Current user data for further processing
    """
    return current_user


def get_user_id_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract user ID directly from JWT token.

    Args:
        credentials: HTTP authorization credentials from header

    Returns:
        User ID string from the token
    """
    token = credentials.credentials
    token_data = verify_token(token)

    if not token_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials - no user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token_data.user_id