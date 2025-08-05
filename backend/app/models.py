from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
from datetime import datetime 


class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_access = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<User(name='{self.name}', email='{self.email}', password='{self.password}', visible='{self.first_access}')>"
