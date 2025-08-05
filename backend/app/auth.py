from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Annotated
from decouple import config
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from fastapi import Depends, HTTPException, status
from .database import get_db
from sqlalchemy.orm import Session


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
oauth2_scheme = HTTPBearer()

SECRET_KEY = config("SECRET_KEY")
ALGORITHM = config("ALGORITHM", default="HS256")
ACCESS_TOKEN_MINUTES = int(config("ACCESS_TOKEN_MINUTES", default="20"))

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_user_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc)+ expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
   
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    from database import SessionLocal
    from models import User
    
    user = db.query(User).filter(User.email == email).first()
    db.close()
    
    if user is None:
        raise credentials_exception
    
    return user
        
    