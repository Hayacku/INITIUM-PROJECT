from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
import os
from datetime import datetime, timezone, timedelta
from models import UserInDB, OAuthAccountInDB, Token
from auth_utils import create_access_token, create_refresh_token
from dependencies import get_db
import uuid

router = APIRouter(prefix="/oauth", tags=["oauth"])

GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# ==================== GITHUB OAUTH ====================

@router.get("/github/login")
async def github_login():
    """Redirect to GitHub OAuth authorization page"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured. Please set GITHUB_CLIENT_ID in .env"
        )
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={FRONTEND_URL}/auth/github/callback"
        f"&scope=user:email"
    )
    
    return {"authorization_url": github_auth_url}

@router.get("/github/callback")
async def github_callback(
    code: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Handle GitHub OAuth callback"""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured"
        )
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code
            }
        )
        
        token_data = token_response.json()
        
        if "error" in token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub OAuth error: {token_data.get('error_description', 'Unknown error')}"
            )
        
        github_access_token = token_data.get("access_token")
        
        # Get user info from GitHub
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/json"
            }
        )
        
        github_user = user_response.json()
        
        # Get user email (if not public)
        if not github_user.get("email"):
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {github_access_token}",
                    "Accept": "application/json"
                }
            )
            emails = email_response.json()
            # Get primary email
            primary_email = next((e for e in emails if e.get("primary")), None)
            if primary_email:
                github_user["email"] = primary_email["email"]
    
    if not github_user.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email from GitHub"
        )
    
    github_user_id = str(github_user["id"])
    github_email = github_user["email"]
    github_username = github_user.get("login", f"github_user_{github_user_id}")
    
    # Check if OAuth account exists
    oauth_account = await db.oauth_accounts.find_one({
        "provider": "github",
        "provider_user_id": github_user_id
    })
    
    if oauth_account:
        # User exists, update tokens
        user_id = oauth_account["user_id"]
        
        await db.oauth_accounts.update_one(
            {"id": oauth_account["id"]},
            {"$set": {
                "access_token": github_access_token,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Check if user exists by email
        existing_user = await db.users.find_one({"email": github_email})
        
        if existing_user:
            user_id = existing_user["id"]
            
            # Link GitHub to existing account
            await db.users.update_one(
                {"id": user_id},
                {"$addToSet": {"oauth_providers": "github"}}
            )
        else:
            # Create new user
            new_user = UserInDB(
                email=github_email,
                username=github_username,
                hashed_password="",  # No password for OAuth users
                is_verified=True,  # GitHub email is verified
                oauth_providers=["github"]
            )
            
            user_dict = new_user.model_dump()
            user_dict['created_at'] = user_dict['created_at'].isoformat()
            user_dict['updated_at'] = user_dict['updated_at'].isoformat()
            
            await db.users.insert_one(user_dict)
            user_id = new_user.id
        
        # Create OAuth account record
        oauth_account_obj = OAuthAccountInDB(
            user_id=user_id,
            provider="github",
            provider_user_id=github_user_id,
            access_token=github_access_token
        )
        
        oauth_dict = oauth_account_obj.model_dump()
        oauth_dict['created_at'] = oauth_dict['created_at'].isoformat()
        
        await db.oauth_accounts.insert_one(oauth_dict)
    
    # Create JWT tokens
    access_token = create_access_token(data={"sub": user_id})
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    # Store refresh token
    from models import RefreshTokenInDB
    refresh_token_doc = RefreshTokenInDB(
        user_id=user_id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    token_dict = refresh_token_doc.model_dump()
    token_dict['created_at'] = token_dict['created_at'].isoformat()
    token_dict['expires_at'] = token_dict['expires_at'].isoformat()
    
    await db.refresh_tokens.insert_one(token_dict)
    
    # Redirect to frontend with tokens
    redirect_url = f"{FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
    
    return RedirectResponse(url=redirect_url)

# ==================== GOOGLE OAUTH (Backend for manual flow) ====================
# Note: Firebase handles Google OAuth on frontend, but we provide backend support

@router.post("/google/link")
async def link_google_account(
    google_id_token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Link Google account using Firebase ID token (handled by Firebase on frontend)"""
    # This endpoint is for manual linking if needed
    # Firebase typically handles this automatically
    return {
        "message": "Google OAuth is handled by Firebase on frontend",
        "status": "use_firebase_auth"
    }
