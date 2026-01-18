from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import (
    UserCreate, UserResponse, UserInDB, LoginRequest, Token,
    RefreshTokenRequest, TwoFASetupResponse, TwoFAVerifyRequest,
    TwoFAEnableRequest, RefreshTokenInDB
)
from auth_utils import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, verify_token, generate_2fa_secret,
    get_totp_uri, generate_qr_code, verify_totp_code, generate_secure_token
)
from dependencies import get_db, get_current_active_user
from datetime import datetime, timedelta, timezone
import uuid

router = APIRouter(prefix="/auth", tags=["authentication"])

# ==================== REGISTER ====================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Register a new user with email/password"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check username
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = UserInDB(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    # Convert to dict and serialize datetime
    user_dict = new_user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    return UserResponse(**new_user.model_dump())

# ==================== LOGIN ====================

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Login with email/password"""
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Convert datetime strings back to datetime objects
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    if isinstance(user_doc.get('updated_at'), str):
        user_doc['updated_at'] = datetime.fromisoformat(user_doc['updated_at'])
    
    user = UserInDB(**user_doc)
    
    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Store refresh token in database
    refresh_token_doc = RefreshTokenInDB(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    token_dict = refresh_token_doc.model_dump()
    token_dict['created_at'] = token_dict['created_at'].isoformat()
    token_dict['expires_at'] = token_dict['expires_at'].isoformat()
    
    await db.refresh_tokens.insert_one(token_dict)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )

# ==================== REFRESH TOKEN ====================

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Refresh access token using refresh token"""
    # Verify refresh token
    token_data = verify_token(refresh_data.refresh_token, token_type="refresh")
    
    if token_data is None or token_data.user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check if refresh token exists and is not revoked
    token_doc = await db.refresh_tokens.find_one({
        "token": refresh_data.refresh_token,
        "revoked": False
    })
    
    if not token_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or revoked"
        )
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(token_doc['expires_at']) if isinstance(token_doc['expires_at'], str) else token_doc['expires_at']
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": token_data.user_id})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_data.refresh_token
    )

# ==================== LOGOUT ====================

@router.post("/logout")
async def logout(
    refresh_data: RefreshTokenRequest,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Logout and revoke refresh token"""
    # Revoke refresh token
    await db.refresh_tokens.update_one(
        {"token": refresh_data.refresh_token, "user_id": current_user.id},
        {"$set": {"revoked": True}}
    )
    
    return {"message": "Successfully logged out"}

# ==================== GET CURRENT USER ====================

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get current user profile"""
    return UserResponse(**current_user.model_dump())

# ==================== 2FA SETUP ====================

@router.post("/2fa/setup", response_model=TwoFASetupResponse)
async def setup_2fa(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate 2FA secret and QR code"""
    # Generate secret
    secret = generate_2fa_secret()
    
    # Generate QR code
    totp_uri = get_totp_uri(secret, current_user.email)
    qr_code = generate_qr_code(totp_uri)
    
    return TwoFASetupResponse(
        secret=secret,
        qr_code=qr_code,
        manual_entry_key=secret
    )

# ==================== 2FA ENABLE ====================

@router.post("/2fa/enable")
async def enable_2fa(
    data: TwoFAEnableRequest,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Enable 2FA after verifying code"""
    # Verify code
    if not verify_totp_code(data.secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Update user
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "two_fa_enabled": True,
            "two_fa_secret": data.secret,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "2FA enabled successfully"}

# ==================== 2FA DISABLE ====================

@router.post("/2fa/disable")
async def disable_2fa(
    data: TwoFAVerifyRequest,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Disable 2FA after verifying code"""
    if not current_user.two_fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled"
        )
    
    # Verify code
    if not verify_totp_code(current_user.two_fa_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Update user
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "two_fa_enabled": False,
            "two_fa_secret": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "2FA disabled successfully"}

# ==================== 2FA VERIFY (DURING LOGIN) ====================

@router.post("/2fa/verify", response_model=Token)
async def verify_2fa(
    data: TwoFAVerifyRequest,
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Verify 2FA code during login"""
    # Find user
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = UserInDB(**user_doc)
    
    if not user.two_fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled for this user"
        )
    
    # Verify code
    if not verify_totp_code(user.two_fa_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Store refresh token
    refresh_token_doc = RefreshTokenInDB(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    token_dict = refresh_token_doc.model_dump()
    token_dict['created_at'] = token_dict['created_at'].isoformat()
    token_dict['expires_at'] = token_dict['expires_at'].isoformat()
    
    await db.refresh_tokens.insert_one(token_dict)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )

# ==================== API KEYS ====================

from models import APIKeyResponse
import secrets

@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    name: str = "Default Key",
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate a new API key"""
    # Generate key
    raw_key = f"sk_ini_{secrets.token_urlsafe(32)}"
    prefix = raw_key[:10]
    hashed_key = get_password_hash(raw_key)
    
    new_key_entry = {
        "prefix": prefix,
        "hashed_key": hashed_key,
        "name": name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_used": None
    }
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"api_keys": new_key_entry}}
    )
    
    return APIKeyResponse(
        key=raw_key,
        prefix=prefix,
        name=name,
        created_at=datetime.now(timezone.utc)
    )

@router.get("/api-keys")
async def get_api_keys(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """List active API keys"""
    keys = []
    for k in current_user.api_keys:
        keys.append({
            "prefix": k.get("prefix"),
            "name": k.get("name"),
            "created_at": k.get("created_at"),
            "last_used": k.get("last_used")
        })
    return {"api_keys": keys}

@router.delete("/api-keys/{prefix}")
async def revoke_api_key(
    prefix: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Revoke an API key"""
    await db.users.update_one(
        {"id": current_user.id},
        {"$pull": {"api_keys": {"prefix": prefix}}}
    )
    return {"message": "API key revoked"}
