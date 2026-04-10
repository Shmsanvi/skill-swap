from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    skills = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    custom_connections = relationship("CustomConnection", back_populates="user")

class Career(Base):
    __tablename__ = "careers"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True)
    label = Column(String)
    color = Column(String)
    skills = Column(JSON)  # {"Python": 0.9, "SQL": 0.7, ...}

class CustomConnection(Base):
    __tablename__ = "custom_connections"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill = Column(String)
    career_slug = Column(String)
    impact = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="custom_connections")