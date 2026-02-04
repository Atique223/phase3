"""Authentication API routes for Todo API with JWT Authentication."""

from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt
from uuid import uuid4

from ...models.database import engine
from ...models.user import User, UserCreate as UserCreateSchema, UserLogin, UserResponse, AuthResponse
from ...auth.jwt_utils import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ...schemas.task import TokenData
from ...auth.deps import get_current_user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password."""
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()

        if user and User.verify_password(password, user.hashed_password):
            return user

        return None


router = APIRouter()

security = HTTPBearer()


@router.post("/signup", tags=["auth"], response_model=AuthResponse)
async def signup(user_data: UserCreateSchema):
    """Register a new user."""
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )

        # Create a new user
        user = user_data.to_user()
        user.id = str(uuid4())  # Generate a unique ID

        session.add(user)
        session.commit()
        session.refresh(user)

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "id": user.id,
            "email": user.email,
            "exp": datetime.utcnow() + access_token_expires
        }
        access_token = create_access_token(data=token_data, expires_delta=access_token_expires)

        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at
            },
            "token": access_token
        }


@router.post("/signin", tags=["auth"], response_model=AuthResponse)
async def signin(login_data: UserLogin):
    """Sign in an existing user."""
    user = authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "id": user.id,
        "email": user.email,
        "exp": datetime.utcnow() + access_token_expires
    }
    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at
        },
        "token": access_token
    }


@router.post("/signout", tags=["auth"])
async def signout():
    """Sign out the current user."""
    # In a real application, you might invalidate the token or add it to a blacklist
    return {"message": "Successfully signed out"}


@router.get("/session", tags=["auth"])
async def get_session(current_user: TokenData = Depends(get_current_user)):
    """Get current session information."""
    with Session(engine) as session:
        # Find user by email in database (since we have the email from token)
        statement = select(User).where(User.email == current_user.email)
        user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at
            }
        }