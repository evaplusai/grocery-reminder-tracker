#!/usr/bin/env python3

from fastapi import FastAPI
from typing import Dict, List
from pydantic import BaseModel
import uvicorn

# Simple test schemas for Swagger demo
class ItemCreate(BaseModel):
    name: str
    quantity: str = None

class Item(BaseModel):
    id: str
    name: str
    quantity: str = None
    completed: bool = False
    store_id: str

class ItemUpdate(BaseModel):
    name: str = None
    quantity: str = None
    completed: bool = None

class User(BaseModel):
    id: int
    email: str
    name: str = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Store(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    bg_color: str
    description: str = None

class StoresResponse(BaseModel):
    stores: List[Store]

class ItemsResponse(BaseModel):
    items: List[Item]

# Create FastAPI app with comprehensive documentation
app = FastAPI(
    title="Grocery Reminder Tracker API",
    description="""
    🛒 **Grocery Reminder Tracker Backend API**
    
    A comprehensive grocery list management system with multi-store support and voice integration.
    
    ## Features
    
    * **Authentication**: JWT-based user authentication with registration and login
    * **Multi-Store Support**: Separate shopping lists for different stores (ShopRite, Costco, CVS, Stop and Shop)
    * **CRUD Operations**: Complete item management (Create, Read, Update, Delete)
    * **User Isolation**: Each user has their own private shopping lists
    * **Real-time Updates**: Instant synchronization across devices
    
    ## Authentication
    
    All protected endpoints require a Bearer token in the Authorization header:
    ```
    Authorization: Bearer <your_jwt_token>
    ```
    
    ## Stores
    
    The system supports these predefined stores:
    - **ShopRite**: General groceries and fresh produce
    - **Costco**: Bulk items and warehouse shopping  
    - **Stop and Shop**: Full grocery with good produce
    - **CVS**: Pharmacy and convenience items
    """,
    version="1.0.0",
    contact={
        "name": "Grocery Tracker Support",
        "email": "support@grocerytracker.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    tags_metadata=[
        {
            "name": "Authentication",
            "description": "User registration, login, and profile management",
        },
        {
            "name": "Stores", 
            "description": "Store information and management",
        },
        {
            "name": "Items",
            "description": "Grocery item CRUD operations",
        },
        {
            "name": "Health",
            "description": "System health and status checks",
        },
    ]
)

# Health check
@app.get(
    "/health",
    tags=["Health"],
    summary="Health Check",
    description="Check if the API is running and healthy",
    response_description="Service health status"
)
def health_check():
    """
    Simple health check endpoint to verify the service is running.
    
    Returns:
        dict: Status message indicating service health
    """
    return {"status": "healthy", "message": "Grocery Tracker API is running!"}

# Authentication endpoints
@app.post(
    "/auth/register",
    response_model=Token,
    tags=["Authentication"],
    summary="Register New User",
    description="Create a new user account",
    response_description="JWT token and user information",
    status_code=201
)
def register(user: UserCreate):
    """
    Register a new user account.
    
    Creates a new user with email and password, returns JWT token for authentication.
    
    Args:
        user: User registration data (email, password, optional name)
        
    Returns:
        Token: JWT access token and user information
        
    Raises:
        HTTPException: 400 if email already exists
    """
    return {
        "access_token": "demo_token_123",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": user.email,
            "name": user.name
        }
    }

@app.post(
    "/auth/login",
    response_model=Token,
    tags=["Authentication"],
    summary="User Login",
    description="Authenticate user with email and password",
    response_description="JWT token and user information"
)
def login(user_credentials: UserLogin):
    """
    Authenticate user and return access token.
    
    Args:
        user_credentials: Email and password for authentication
        
    Returns:
        Token: JWT access token and user information
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    return {
        "access_token": "demo_token_123",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": user_credentials.email,
            "name": "Demo User"
        }
    }

@app.get(
    "/auth/me",
    response_model=User,
    tags=["Authentication"],
    summary="Get Current User",
    description="Get current authenticated user information",
    response_description="Current user profile"
)
def get_current_user_info():
    """
    Get current authenticated user information.
        
    Returns:
        User: Current user profile information
    """
    return {
        "id": 1,
        "email": "demo@example.com",
        "name": "Demo User"
    }

# Store endpoints
@app.get(
    "/stores",
    response_model=StoresResponse,
    tags=["Stores"],
    summary="Get All Stores",
    description="Retrieve list of all available stores",
    response_description="List of available stores with details"
)
def get_stores():
    """
    Get all available stores.
    
    Returns information about all stores where users can create shopping lists.
        
    Returns:
        StoresResponse: List of stores with details (name, icon, description, etc.)
    """
    return {
        "stores": [
            {
                "id": "shoprite",
                "name": "ShopRite",
                "icon": "🛒",
                "color": "text-red-600",
                "bg_color": "bg-red-50",
                "description": "General groceries and fresh produce"
            },
            {
                "id": "costco",
                "name": "Costco",
                "icon": "📦",
                "color": "text-blue-600",
                "bg_color": "bg-blue-50",
                "description": "Bulk items and warehouse shopping"
            }
        ]
    }

# Item endpoints
@app.get(
    "/stores/{store_id}/items",
    response_model=ItemsResponse,
    tags=["Items"],
    summary="Get Items by Store",
    description="Get all grocery items for a specific store and user",
    response_description="List of grocery items for the specified store"
)
def get_items_by_store(store_id: str):
    """
    Get all grocery items for a specific store.
    
    Retrieves all items in the user's shopping list for the specified store.
    Items are ordered by creation date (newest first).
    
    Args:
        store_id: Store identifier (shoprite, costco, stop-and-shop, cvs)
        
    Returns:
        ItemsResponse: List of grocery items for the store
        
    Raises:
        HTTPException: 404 if store not found
    """
    return {
        "items": [
            {
                "id": "item_123",
                "name": "Organic Bananas",
                "quantity": "2 lbs",
                "completed": False,
                "store_id": store_id
            }
        ]
    }

@app.post(
    "/stores/{store_id}/items",
    response_model=Item,
    tags=["Items"],
    summary="Create New Item",
    description="Add a new grocery item to a specific store's shopping list",
    response_description="Created grocery item with details",
    status_code=201
)
def create_item(store_id: str, item: ItemCreate):
    """
    Create a new grocery item for a specific store.
    
    Adds a new item to the user's shopping list for the specified store.
    Each item belongs to a specific user and store.
    
    Args:
        store_id: Store identifier (shoprite, costco, stop-and-shop, cvs)
        item: Item creation data (name, optional quantity)
        
    Returns:
        Item: Created grocery item with ID and timestamps
        
    Raises:
        HTTPException: 404 if store not found
        HTTPException: 401 if user not authenticated
    """
    return {
        "id": "new_item_456",
        "name": item.name,
        "quantity": item.quantity,
        "completed": False,
        "store_id": store_id
    }

@app.patch(
    "/items/{item_id}",
    response_model=Item,
    tags=["Items"],
    summary="Update Item",
    description="Update an existing grocery item (name, quantity, or completion status)",
    response_description="Updated grocery item with new details"
)
def update_item(item_id: str, item_update: ItemUpdate):
    """
    Update an existing grocery item.
    
    Allows updating item name, quantity, or completion status.
    Users can only update their own items.
    
    Args:
        item_id: Unique item identifier
        item_update: Fields to update (name, quantity, completed)
        
    Returns:
        Item: Updated grocery item with new details
        
    Raises:
        HTTPException: 404 if item not found or doesn't belong to user
        HTTPException: 401 if user not authenticated
    """
    return {
        "id": item_id,
        "name": item_update.name or "Updated Item",
        "quantity": item_update.quantity,
        "completed": item_update.completed or False,
        "store_id": "shoprite"
    }

@app.delete(
    "/items/{item_id}",
    tags=["Items"],
    summary="Delete Item",
    description="Remove a grocery item from the shopping list",
    response_description="Confirmation message for successful deletion",
    status_code=200
)
def delete_item(item_id: str):
    """
    Delete a grocery item from the shopping list.
    
    Permanently removes an item from the user's shopping list.
    Users can only delete their own items.
    
    Args:
        item_id: Unique item identifier
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException: 404 if item not found or doesn't belong to user
        HTTPException: 401 if user not authenticated
    """
    return {"message": "Item deleted successfully"}

if __name__ == "__main__":
    print("🛒 Starting Grocery Tracker API with Swagger documentation")
    print("📚 Swagger UI available at: http://localhost:8000/docs")
    print("📋 ReDoc available at: http://localhost:8000/redoc")
    uvicorn.run(app, host="0.0.0.0", port=8000)