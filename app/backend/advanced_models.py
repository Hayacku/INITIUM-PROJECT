from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid

# ==================== NOTES AVANCÉES ====================

class BacklinkModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_id: str
    target_id: str
    source_type: str = "note"  # note, quest, task
    target_type: str = "note"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NoteTemplateModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    content: str
    category: str  # GTD, PARA, Zettelkasten, Cornell
    properties: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HABITUDES AVANCÉES ====================

class MoodEntryModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    habit_id: Optional[str] = None
    mood: str  # 😊, 😐, 😢, etc.
    energy_level: int = Field(ge=1, le=5)
    notes: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HabitMetricModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    habit_id: str
    metric_type: str  # weight, time, distance, count
    value: float
    unit: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== GAMIFICATION 2.0 ====================

class AchievementModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str  # unique code
    name: str
    description: str
    icon: str
    category: str  # streak, xp, quest, habit, social
    requirement: Dict[str, Any]
    reward_xp: int = 0
    reward_coins: int = 0
    rarity: str = "common"  # common, rare, epic, legendary
    secret: bool = False

class UserAchievementModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    achievement_id: str
    unlocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    progress: int = 100

class LeaderboardEntryModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    total_xp: int
    level: int
    rank: int
    avatar_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GuildModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    owner_id: str
    member_ids: List[str] = Field(default_factory=list)
    total_xp: int = 0
    level: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== INTÉGRATIONS ====================

class WebhookModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    url: str
    events: List[str]  # quest_completed, level_up, etc.
    active: bool = True
    secret: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IntegrationModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    provider: str  # google_calendar, notion, spotify, etc.
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== POMODORO ====================

class PomodoroSessionModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    task_id: Optional[str] = None
    duration: int = 25  # minutes
    type: str = "work"  # work, short_break, long_break
    completed: bool = False
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

# ==================== AUTOMATION ====================

class AutomationModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    trigger: Dict[str, Any]  # {type: "time", schedule: "daily"}
    actions: List[Dict[str, Any]]  # [{type: "create_quest", ...}]
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
