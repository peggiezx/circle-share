from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone


class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_access = Column(DateTime, default=datetime.utcnow)
    # Relationships
    # when a circle is created, the circle.creator variable is initiated as the user who created this circle
    created_circles = relationship("Circle", back_populates="creator")
    # connects the Circle class with the association class Circle Member, when it's associated, the circle.members wil be associated to users
    circles = relationship("Circle", secondary="circle_members", back_populates="members")
    
    
    
class Circle(Base):
    __tablename__ = 'circles'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    creator_id = Column(Integer, ForeignKey('users.id'))
    
    creator = relationship("User", back_populates='created_circles')
    members = relationship("User", secondary="circle_members", back_populates="circles")


class CircleMember(Base):
    __tablename__ = "circle_members"
    
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    circle_id = Column(Integer, ForeignKey('circles.id'), primary_key=True)
    joined_at = Column(DateTime, default=datetime.now(timezone.utc))