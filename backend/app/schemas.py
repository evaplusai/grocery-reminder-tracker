from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Store Schemas
class StoreBase(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    bg_color: str
    description: Optional[str] = None

class Store(StoreBase):
    class Config:
        from_attributes = True

# Item Schemas
class ItemBase(BaseModel):
    name: str
    quantity: Optional[str] = None

class ItemCreate(ItemBase):
    # store_id will be set from URL path, not from request body
    pass

class ItemCreateInternal(ItemBase):
    # Internal schema with store_id for database operations
    store_id: str

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    completed: Optional[bool] = None

class Item(ItemCreateInternal):
    id: str
    completed: bool
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Response Schemas
class ItemsResponse(BaseModel):
    items: List[Item]
    
class StoresResponse(BaseModel):
    stores: List[Store]