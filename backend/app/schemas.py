from pydantic import BaseModel, EmailStr, field_validator
import datetime

class JournalEntry(BaseModel):
    title: str
    date: datetime.date
    content: str = "Write down something going on about your life"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    
    @field_validator('password')
    def password_must_be_strong(cls, v):
        if (len(v) < 8):
            return ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str