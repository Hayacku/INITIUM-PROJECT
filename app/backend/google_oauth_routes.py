"""
Google OAuth routes for Firebase ID token verification.
This module handles Google OAuth authentication using Firebase ID tokens.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import os

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models import UserInDB, OAuthAccountInDB, RefreshTokenInDB
from auth_utils import create_access_token, create_refresh_token
from dependencies import get_db
import uuid

router = APIRouter(prefix="/oauth", tags=["oauth"])

# Google OAuth configuration  
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")

class GoogleTokenRequest(BaseModel):
    id_token: str

@router.post("/google/verify")
async def verify_google_token(
    token_data: GoogleTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Verify Google Firebase ID token and create/login user.
    
    This endpoint receives a Firebase ID token from the frontend,
    verifies it with Google, and returns JWT tokens for the user.
    """
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env"
        )
    
    try:
        # Verify the Firebase ID token using google-auth library
        print(f"[DEBUG] Verifying Firebase ID token...")
        
        try:
            # Verify the token - Firebase tokens use the project ID as audience
            idinfo = id_token.verify_firebase_token(
                token_data.id_token,
                google_requests.Request(),
                audience=FIREBASE_PROJECT_ID
            )
            
            print(f"[DEBUG] Token verified successfully")
            print(f"[DEBUG] Token info keys: {idinfo.keys()}")
            
        except ValueError as e:
            print(f"[ERROR] Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Firebase ID token: {str(e)}"
            )
        
        # Extract user information
        google_user_id = idinfo.get("sub") or idinfo.get("user_id")
        email = idinfo.get("email")
        email_verified = idinfo.get("email_verified", False)
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")
        
        print(f"[DEBUG] User info - Email: {email}, ID: {google_user_id}")
        
        if not email or not google_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract user information from token"
            )
        
        # Check if OAuth account exists
        oauth_account = await db.oauth_accounts.find_one({
            "provider": "google",
            "provider_user_id": google_user_id
        })
        
        if oauth_account:
            # User exists, get user_id
            user_id = oauth_account["user_id"]
            print(f"[DEBUG] Existing OAuth account found for user: {user_id}")
            
            # Update OAuth account
            await db.oauth_accounts.update_one(
                {"id": oauth_account["id"]},
                {"$set": {
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        else:
            # Check if user exists by email
            existing_user = await db.users.find_one({"email": email})
            
            if existing_user:
                user_id = existing_user["id"]
                print(f"[DEBUG] Linking Google to existing user: {user_id}")
                
                # Link Google to existing account
                await db.users.update_one(
                    {"id": user_id},
                    {"$addToSet": {"oauth_providers": "google"}}
                )
            else:
                # Create new user
                username = email.split("@")[0]  # Use email prefix as username
                print(f"[DEBUG] Creating new user with email: {email}")
                
                new_user = UserInDB(
                    email=email,
                    username=username,
                    hashed_password="",  # No password for OAuth users
                    is_verified=email_verified,
                    oauth_providers=["google"],
                    profile_picture=picture
                )
                
                user_dict = new_user.model_dump()
                user_dict['created_at'] = user_dict['created_at'].isoformat()
                user_dict['updated_at'] = user_dict['updated_at'].isoformat()
                
                await db.users.insert_one(user_dict)
                user_id = new_user.id
            
            # Create OAuth account record
            oauth_account_obj = OAuthAccountInDB(
                user_id=user_id,
                provider="google",
                provider_user_id=google_user_id,
                access_token=token_data.id_token  # Store the ID token
            )
            
            oauth_dict = oauth_account_obj.model_dump()
            oauth_dict['created_at'] = oauth_dict['created_at'].isoformat()
            
            await db.oauth_accounts.insert_one(oauth_dict)
        
        # Create JWT tokens
        print(f"[DEBUG] Creating JWT tokens for user: {user_id}")
        access_token = create_access_token(data={"sub": user_id})
        refresh_token = create_refresh_token(data={"sub": user_id})
        
        # Store refresh token
        refresh_token_doc = RefreshTokenInDB(
            user_id=user_id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30)
        )
        
        token_dict = refresh_token_doc.model_dump()
        token_dict['created_at'] = token_dict['created_at'].isoformat()
        token_dict['expires_at'] = token_dict['expires_at'].isoformat()
        
        await db.refresh_tokens.insert_one(token_dict)
        
        print(f"[DEBUG] Successfully authenticated user: {user_id}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error verifying Google token: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying Google token: {str(e)}"
        )
