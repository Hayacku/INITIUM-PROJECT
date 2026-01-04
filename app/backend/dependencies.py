from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from models import UserInDB, TokenData
from auth_utils import verify_token
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database dependency
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

security = HTTPBearer()

async def get_db() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_db)
) -> UserInDB:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = verify_token(token, token_type="access")
    
    if token_data is None or token_data.user_id is None:
        raise credentials_exception
    
    user = await database.users.find_one({"id": token_data.user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    
    return UserInDB(**user)

async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_db)
) -> Optional[UserInDB]:
    """Get current user if authenticated, None otherwise"""
    if credentials is None:
        return None
    
    token = credentials.credentials
    token_data = verify_token(token, token_type="access")
    
    if token_data is None or token_data.user_id is None:
        return None
    
    user = await database.users.find_one({"id": token_data.user_id}, {"_id": 0})
    if user is None:
        return None
    
    return UserInDB(**user)
