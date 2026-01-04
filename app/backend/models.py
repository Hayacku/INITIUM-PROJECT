from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# ==================== USER MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    level: int = 1
    xp: int = 0
    xp_to_next_level: int = 100
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # 2FA
    two_fa_enabled: bool = False
    two_fa_secret: Optional[str] = None
    
    # OAuth
    oauth_providers: List[str] = Field(default_factory=list)
    
    # API Keys
    api_keys: List[dict] = Field(default_factory=list)  # List of {"prefix": str, "hashed_key": str, "name": str, "created_at": datetime, "last_used": datetime}

class APIKeyResponse(BaseModel):
    key: str # Only returned once upon creation
    prefix: str
    name: str
    created_at: datetime


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    level: int
    xp: int
    xp_to_next_level: int
    avatar_url: Optional[str] = None
    two_fa_enabled: bool
    oauth_providers: List[str]
    created_at: datetime

class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[EmailStr] = None

# ==================== AUTH MODELS ====================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    revoked: bool = False

# ==================== 2FA MODELS ====================

class TwoFASetupResponse(BaseModel):
    secret: str
    qr_code: str  # Base64 encoded QR code
    manual_entry_key: str

class TwoFAVerifyRequest(BaseModel):
    code: str

class TwoFAEnableRequest(BaseModel):
    code: str
    secret: str

# ==================== OAUTH MODELS ====================

class OAuthAccountInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    provider: str  # google, github, etc.
    provider_user_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== SESSION MODELS ====================

class SessionInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
