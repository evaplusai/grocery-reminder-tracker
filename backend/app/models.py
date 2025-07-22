from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    items = relationship("Item", back_populates="user")

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(String, primary_key=True, index=True)  # shoprite, costco, etc.
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    color = Column(String, nullable=False)
    bg_color = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    items = relationship("Item", back_populates="store")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(String, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="items")
    store = relationship("Store", back_populates="items")