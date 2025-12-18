"""
Authentication router for user signup, login, logout, and profile
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from ..models.user import UserCreate, UserResponse
from ..utils.security import hash_password, verify_password, create_access_token, verify_token
from ..database import get_database

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user
    
    Args:
        user_data: User registration data (email and password)
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If email already exists or validation fails
    """
    db = get_database()
    users_collection = db["users"]
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user document
    now = datetime.utcnow()
    user_doc = {
        "email": user_data.email,
        "password_hash": password_hash,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert user into database
    result = await users_collection.insert_one(user_doc)
    
    return {"message": "User created successfully"}


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user and return JWT access token
    
    Args:
        form_data: OAuth2 form data containing username (email) and password
        
    Returns:
        dict: Access token and token type
        
    Raises:
        HTTPException: If credentials are invalid
    """
    db = get_database()
    users_collection = db["users"]
    
    # Find user by email (username field in OAuth2 form)
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user_id in "sub" claim
    access_token = create_access_token(
        data={"sub": str(user["_id"])}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout():
    """
    Logout user (stateless - client removes token)
    
    Returns:
        dict: Success message
    """
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(token: str = Depends(oauth2_scheme)):
    """
    Get current authenticated user's profile
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        UserResponse: User profile data
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    # Verify token and extract payload
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    db = get_database()
    users_collection = db["users"]
    
    from bson import ObjectId
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return user response
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        created_at=user["created_at"]
    )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(token: str = Depends(oauth2_scheme)):
    """
    Delete current user account and all associated data
    """
    # Verify token
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    db = get_database()
    users_collection = db["users"]
    scripts_collection = db["scripts"]
    budget_collection = db["budget_models"]
    queries_collection = db["commercial_queries"]
    
    # Validate user exists
    from bson import ObjectId
    try:
        user_oid = ObjectId(user_id)
        user = await users_collection.find_one({"_id": user_oid})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user ID")
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # 1. Find all user's scripts
        cursor = scripts_collection.find({"user_id": user_id})
        user_scripts = await cursor.to_list(length=None)
        script_ids = [str(s["_id"]) for s in user_scripts]
        
        # 2. Delete budgets associated with these scripts
        if script_ids:
            await budget_collection.delete_many({"script_id": {"$in": script_ids}})
            
            # 3. Delete commercial queries associated with these scripts
            await queries_collection.delete_many({"script_id": {"$in": script_ids}})
            
            # 4. Delete the scripts themselves
            await scripts_collection.delete_many({"user_id": user_id})
            
        # 5. Delete the user
        await users_collection.delete_one({"_id": user_oid})
        
        return
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )