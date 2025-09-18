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
    name: Optional[str] = Field(default=None, min_length=1, max_length=180)


class CircleResponse(BaseModel):
    id: int
    name: str
    creator_id: int
    member_count: Optional[int] = 0
    
    class Config:
        from_attributes = True 


class CirclesJoinedResponse(BaseModel):
    created_circles: list[CircleResponse] # Circles you created
    member_circles: list[CircleResponse] # Circles you're a member of


class MyCircleResponse(BaseModel):
    id: int
    name: str
    member_count: int
    
# bfore joining the circle
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        orm_mode = True

# after joining the circle
class MemberResponse(BaseModel):
    id: int
    name: str
    email: str
    # joined_at: datetime
    
    class Config:
        orm_mode = True

class Invitee(BaseModel):
    email: EmailStr
    
    
class InvitationResponse(BaseModel):
    id: int
    from_user_name: str
    from_user_email: str
    status: str
    created_at:datetime
    
    class Config:
        orm_mode = True


class InvitationAction(BaseModel):
    action: str


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
    photo_url: str | None = None
    created_at: datetime
    author_name: str
    like_count: int = 0
    user_liked: bool = False

# Comment related
class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)

class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    content: str
    created_at: datetime
    author_name: str
    
    class Config:
        from_attributes = True

# Like related
class LikeResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    created_at: datetime
    user_name: str
    
    class Config:
        from_attributes = True