from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import User, Item, Store
from app.schemas import UserCreate, ItemCreate, ItemUpdate
from app.auth import get_password_hash
from typing import List, Optional
import uuid

# User CRUD
def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Store CRUD
def get_stores(db: Session) -> List[Store]:
    return db.query(Store).all()

def get_store(db: Session, store_id: str) -> Optional[Store]:
    return db.query(Store).filter(Store.id == store_id).first()

def create_default_stores(db: Session):
    """Create default stores if they don't exist"""
    default_stores = [
        {
            "id": "shoprite",
            "name": "ShopRite",
            "icon": "🏪",
            "color": "text-red-600",
            "bg_color": "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30",
            "description": "General groceries and fresh produce"
        },
        {
            "id": "costco",
            "name": "Costco",
            "icon": "🏬",
            "color": "text-blue-600",
            "bg_color": "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
            "description": "Bulk items and warehouse shopping"
        },
        {
            "id": "stop-and-shop",
            "name": "Stop and Shop",
            "icon": "🛍️",
            "color": "text-green-600",
            "bg_color": "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30",
            "description": "Full grocery with good produce"
        },
        {
            "id": "cvs",
            "name": "CVS",
            "icon": "💊",
            "color": "text-purple-600",
            "bg_color": "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
            "description": "Pharmacy and convenience items"
        }
    ]
    
    for store_data in default_stores:
        if not get_store(db, store_data["id"]):
            db_store = Store(**store_data)
            db.add(db_store)
    
    db.commit()

# Item CRUD
def get_items_by_store(db: Session, user_id: int, store_id: str) -> List[Item]:
    return db.query(Item).filter(
        and_(Item.user_id == user_id, Item.store_id == store_id)
    ).order_by(Item.created_at.desc()).all()

def get_item(db: Session, item_id: str, user_id: int) -> Optional[Item]:
    return db.query(Item).filter(
        and_(Item.id == item_id, Item.user_id == user_id)
    ).first()

def create_item(db: Session, item: ItemCreate, user_id: int) -> Item:
    item_id = f"item_{uuid.uuid4().hex[:16]}"
    db_item = Item(
        id=item_id,
        name=item.name,
        quantity=item.quantity,
        store_id=item.store_id,
        user_id=user_id,
        completed=False
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: str, item_update: ItemUpdate, user_id: int) -> Optional[Item]:
    db_item = get_item(db, item_id, user_id)
    if not db_item:
        return None
    
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: str, user_id: int) -> bool:
    db_item = get_item(db, item_id, user_id)
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True