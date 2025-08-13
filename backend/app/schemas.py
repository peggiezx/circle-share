from pydantic import BaseModel, EmailStr, field_validator, Field, ConfigDict
from typing import Optional
from datetime import datetime, date

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=50)
    
    @field_validator('password')
    def validate_password(cls, v):
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')

        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v
        
        
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ErrorDetail(BaseModel):
    type: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
    details: Optional[list[str]] = None
    

class CircleCreate(BaseModel):
    name: str = Field(default="My Circle", min_length=1, max_length=180)


class CircleResponse(BaseModel):
    id: int
    name: str
    creator_id: int
    member_count: Optional[int] = 0
    
    class Config:
        from_attributes = True 


class MyCirclesResponse(BaseModel):
    created_circles: list[CircleResponse] # Circles you created
    member_circles: list[CircleResponse] # Circles you're a member of


class Invitee(BaseModel):
    email: EmailStr
    
    
class InviteeResponse(BaseModel):
    circle_joined: str
    circle_owner: str


class MemberToRemove(BaseModel):
    email: EmailStr


# Post related
class PostBase(BaseModel):
    circle_id: int
    content: str = "Write down something going on about your life"

class PostResponse(BaseModel):
    post_id: int
    circle_id: int
    author_id: int
    content: str
    create_at: datetime
    author_name: str