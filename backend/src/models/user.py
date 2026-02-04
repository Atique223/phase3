"""User model definition for Todo API."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
import re
import bcrypt


def hash_password_func(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


class UserBase(SQLModel):
    """Base class for User model with common fields."""
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(unique=True, min_length=5, max_length=255)


class User(UserBase, table=True):
    """User model for the database table."""
    id: Optional[str] = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def set_password(self, password: str):
        """Hash and set the password."""
        self.hashed_password = hash_password_func(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(min_length=6, max_length=128)

    def to_user(self) -> User:
        """Convert to User model."""
        user = User(name=self.name, email=self.email)
        user.set_password(self.password)
        return user


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(UserBase):
    """Schema for returning user data."""
    id: str
    created_at: datetime


class AuthResponse(SQLModel):
    """Schema for authentication response with user and token."""
    user: UserResponse
    token: str