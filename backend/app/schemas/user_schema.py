from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language_preference: Optional[str] = None

class PasswordReset(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    language_preference: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    pass