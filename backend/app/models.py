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
    posts = relationship("Post", back_populates="author")
    
    
    
class Circle(Base):
    __tablename__ = 'circles'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    creator_id = Column(Integer, ForeignKey('users.id'))
    
    creator = relationship("User", back_populates='created_circles')
    members = relationship("User", secondary="circle_members", back_populates="circles")
    posts = relationship("Post", back_populates="circle")


class CircleMember(Base):
    __tablename__ = "circle_members"
    
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    circle_id = Column(Integer, ForeignKey('circles.id'), primary_key=True)
    joined_at = Column(DateTime, default=datetime.now(timezone.utc))


class Post(Base):
    __tablename__ = "posts"
    
    post_id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey('circles.id'))
    author_id = Column(Integer, ForeignKey('users.id'))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("User", back_populates="posts")
    circle = relationship("Circle", back_populates="posts")


class CircleInvitation(Base):
    __tablename__ = "circle_invites"
    
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])