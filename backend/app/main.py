from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

from app.database import engine, get_db, SessionLocal
from app import models, schemas, crud, auth

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

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

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Initialize default data on startup"""
    db = SessionLocal()
    try:
        crud.create_default_stores(db)
    finally:
        db.close()

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
    response_model=schemas.Token,
    tags=["Authentication"],
    summary="Register New User",
    description="Create a new user account",
    response_description="JWT token and user information",
    status_code=201
)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with email and password, returns JWT token for authentication.
    
    Args:
        user: User registration data (email, password, optional name)
        db: Database session
        
    Returns:
        Token: JWT access token and user information
        
    Raises:
        HTTPException: 400 if email already exists
    """
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create user
    db_user = crud.create_user(db=db, user=user)
    
    # Create access token
    access_token = auth.create_access_token(data={"sub": str(db_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.post(
    "/auth/login",
    response_model=schemas.Token,
    tags=["Authentication"],
    summary="User Login",
    description="Authenticate user with email and password",
    response_description="JWT token and user information"
)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token.
    
    Args:
        user_credentials: Email and password for authentication
        db: Database session
        
    Returns:
        Token: JWT access token and user information
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    user = auth.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get(
    "/auth/me",
    response_model=schemas.User,
    tags=["Authentication"],
    summary="Get Current User",
    description="Get current authenticated user information",
    response_description="Current user profile"
)
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user)):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user (from JWT token)
        
    Returns:
        User: Current user profile information
    """
    return current_user

# Store endpoints
@app.get(
    "/stores",
    response_model=schemas.StoresResponse,
    tags=["Stores"],
    summary="Get All Stores",
    description="Retrieve list of all available stores",
    response_description="List of available stores with details"
)
def get_stores(db: Session = Depends(get_db)):
    """
    Get all available stores.
    
    Returns information about all stores where users can create shopping lists.
    
    Args:
        db: Database session
        
    Returns:
        StoresResponse: List of stores with details (name, icon, description, etc.)
    """
    stores = crud.get_stores(db)
    return {"stores": stores}

# Item endpoints
@app.get(
    "/stores/{store_id}/items",
    response_model=schemas.ItemsResponse,
    tags=["Items"],
    summary="Get Items by Store",
    description="Get all grocery items for a specific store and user",
    response_description="List of grocery items for the specified store"
)
def get_items_by_store(
    store_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all grocery items for a specific store.
    
    Retrieves all items in the user's shopping list for the specified store.
    Items are ordered by creation date (newest first).
    
    Args:
        store_id: Store identifier (shoprite, costco, stop-and-shop, cvs)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ItemsResponse: List of grocery items for the store
        
    Raises:
        HTTPException: 404 if store not found
    """
    # Verify store exists
    store = crud.get_store(db, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    items = crud.get_items_by_store(db, current_user.id, store_id)
    return {"items": items}

@app.post(
    "/stores/{store_id}/items",
    response_model=schemas.Item,
    tags=["Items"],
    summary="Create New Item",
    description="Add a new grocery item to a specific store's shopping list",
    response_description="Created grocery item with details",
    status_code=201
)
def create_item(
    store_id: str,
    item: schemas.ItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new grocery item for a specific store.
    
    Adds a new item to the user's shopping list for the specified store.
    Each item belongs to a specific user and store.
    
    Args:
        store_id: Store identifier (shoprite, costco, stop-and-shop, cvs)
        item: Item creation data (name, optional quantity)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Item: Created grocery item with ID and timestamps
        
    Raises:
        HTTPException: 404 if store not found
        HTTPException: 401 if user not authenticated
    """
    # Verify store exists
    store = crud.get_store(db, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    # Create internal item with store_id from URL
    internal_item = schemas.ItemCreateInternal(
        name=item.name,
        quantity=item.quantity,
        store_id=store_id
    )
    return crud.create_item(db, internal_item, current_user.id)

@app.patch(
    "/items/{item_id}",
    response_model=schemas.Item,
    tags=["Items"],
    summary="Update Item",
    description="Update an existing grocery item (name, quantity, or completion status)",
    response_description="Updated grocery item with new details"
)
def update_item(
    item_id: str,
    item_update: schemas.ItemUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing grocery item.
    
    Allows updating item name, quantity, or completion status.
    Users can only update their own items.
    
    Args:
        item_id: Unique item identifier
        item_update: Fields to update (name, quantity, completed)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Item: Updated grocery item with new details
        
    Raises:
        HTTPException: 404 if item not found or doesn't belong to user
        HTTPException: 401 if user not authenticated
    """
    updated_item = crud.update_item(db, item_id, item_update, current_user.id)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@app.delete(
    "/items/{item_id}",
    tags=["Items"],
    summary="Delete Item",
    description="Remove a grocery item from the shopping list",
    response_description="Confirmation message for successful deletion",
    status_code=200
)
def delete_item(
    item_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a grocery item from the shopping list.
    
    Permanently removes an item from the user's shopping list.
    Users can only delete their own items.
    
    Args:
        item_id: Unique item identifier
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException: 404 if item not found or doesn't belong to user
        HTTPException: 401 if user not authenticated
    """
    success = crud.delete_item(db, item_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)