from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserInDB
from dependencies import get_db, get_current_active_user
from advanced_models import (
    AchievementModel, UserAchievementModel, LeaderboardEntryModel, GuildModel
)
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/gamification", tags=["gamification"])

# ==================== ACHIEVEMENTS ====================

# Predefined achievements
PREDEFINED_ACHIEVEMENTS = [
    {"code": "first_quest", "name": "Première Quête", "description": "Complétez votre première quête", "icon": "⚔️", "category": "quest", "requirement": {"quests_completed": 1}, "reward_xp": 50, "reward_coins": 10, "rarity": "common"},
    {"code": "quest_master", "name": "Maître des Quêtes", "description": "Complétez 50 quêtes", "icon": "🏆", "category": "quest", "requirement": {"quests_completed": 50}, "reward_xp": 500, "reward_coins": 100, "rarity": "epic"},
    {"code": "streak_7", "name": "Série de 7", "description": "Maintenez une série de 7 jours", "icon": "🔥", "category": "streak", "requirement": {"streak_days": 7}, "reward_xp": 100, "reward_coins": 25, "rarity": "common"},
    {"code": "streak_30", "name": "Série de 30", "description": "Maintenez une série de 30 jours", "icon": "🔥", "category": "streak", "requirement": {"streak_days": 30}, "reward_xp": 500, "reward_coins": 100, "rarity": "rare"},
    {"code": "streak_100", "name": "Centenaire", "description": "100 jours consécutifs", "icon": "🌟", "category": "streak", "requirement": {"streak_days": 100}, "reward_xp": 2000, "reward_coins": 500, "rarity": "legendary"},
    {"code": "xp_1000", "name": "Millier d'XP", "description": "Atteignez 1000 XP", "icon": "⭐", "category": "xp", "requirement": {"total_xp": 1000}, "reward_xp": 0, "reward_coins": 50, "rarity": "common"},
    {"code": "xp_10000", "name": "Dix Mille", "description": "Atteignez 10000 XP", "icon": "🌟", "category": "xp", "requirement": {"total_xp": 10000}, "reward_xp": 0, "reward_coins": 500, "rarity": "epic"},
    {"code": "level_10", "name": "Niveau 10", "description": "Atteignez le niveau 10", "icon": "🎯", "category": "level", "requirement": {"level": 10}, "reward_xp": 200, "reward_coins": 50, "rarity": "common"},
    {"code": "level_50", "name": "Niveau 50", "description": "Atteignez le niveau 50", "icon": "👑", "category": "level", "requirement": {"level": 50}, "reward_xp": 1000, "reward_coins": 250, "rarity": "epic"},
    {"code": "early_bird", "name": "Lève-tôt", "description": "Complétez 10 tâches avant 8h", "icon": "🌅", "category": "habit", "requirement": {"tasks_before_8am": 10}, "reward_xp": 150, "reward_coins": 30, "rarity": "rare", "secret": True},
    {"code": "night_owl", "name": "Noctambule", "description": "Complétez 10 tâches après 22h", "icon": "🦉", "category": "habit", "requirement": {"tasks_after_10pm": 10}, "reward_xp": 150, "reward_coins": 30, "rarity": "rare", "secret": True},
    {"code": "social_butterfly", "name": "Papillon Social", "description": "Rejoignez une guilde", "icon": "🦋", "category": "social", "requirement": {"guilds_joined": 1}, "reward_xp": 100, "reward_coins": 20, "rarity": "common"},
    {"code": "perfectionist", "name": "Perfectionniste", "description": "Complétez 20 quêtes avec 100% de progression", "icon": "💯", "category": "quest", "requirement": {"perfect_quests": 20}, "reward_xp": 300, "reward_coins": 75, "rarity": "rare"},
    {"code": "bookworm", "name": "Rat de Bibliothèque", "description": "Créez 50 notes", "icon": "📚", "category": "notes", "requirement": {"notes_created": 50}, "reward_xp": 200, "reward_coins": 50, "rarity": "common"},
    {"code": "fitness_guru", "name": "Gourou du Fitness", "description": "Complétez 30 sessions d'entraînement", "icon": "🏋️", "category": "training", "requirement": {"training_sessions": 30}, "reward_xp": 400, "reward_coins": 100, "rarity": "rare"},
]

@router.get("/achievements", response_model=List[dict])
async def get_all_achievements(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all available achievements"""
    # Initialize predefined achievements if not exists
    existing_count = await db.achievements.count_documents({})
    
    if existing_count == 0:
        # Insert predefined achievements
        for ach in PREDEFINED_ACHIEVEMENTS:
            ach_model = AchievementModel(**ach, id=ach['code'])
            doc = ach_model.model_dump()
            await db.achievements.insert_one(doc)
    
    achievements = await db.achievements.find({}, {"_id": 0}).to_list(1000)
    return achievements

@router.get("/my-achievements")
async def get_user_achievements(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's unlocked achievements"""
    unlocked = await db.user_achievements.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    return {"unlocked": unlocked, "total": len(PREDEFINED_ACHIEVEMENTS)}

# ==================== LEADERBOARD ====================

@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get global leaderboard"""
    # Get top users by XP
    users = await db.users.find(
        {},
        {"_id": 0, "id": 1, "username": 1, "xp": 1, "level": 1, "avatar_url": 1}
    ).sort("xp", -1).limit(limit).to_list(limit)
    
    # Add ranks
    leaderboard = []
    for idx, user in enumerate(users, 1):
        leaderboard.append({
            "rank": idx,
            "user_id": user["id"],
            "username": user.get("username", "Anonymous"),
            "total_xp": user.get("xp", 0),
            "level": user.get("level", 1),
            "avatar_url": user.get("avatar_url")
        })
    
    return {"leaderboard": leaderboard}

@router.get("/my-rank")
async def get_my_rank(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user's rank"""
    # Count users with more XP
    higher_rank_count = await db.users.count_documents({"xp": {"$gt": current_user.xp}})
    
    return {
        "rank": higher_rank_count + 1,
        "username": current_user.username,
        "xp": current_user.xp,
        "level": current_user.level
    }

# ==================== GUILDS ====================

@router.post("/guilds")
async def create_guild(
    name: str,
    description: str,
    icon: str = "🛡️",
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new guild"""
    guild = GuildModel(
        name=name,
        description=description,
        icon=icon,
        owner_id=current_user.id,
        member_ids=[current_user.id]
    )
    
    doc = guild.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.guilds.insert_one(doc)
    
    return {"success": True, "guild_id": guild.id}

@router.get("/guilds")
async def get_guilds(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all guilds"""
    guilds = await db.guilds.find({}, {"_id": 0}).to_list(1000)
    return {"guilds": guilds}

@router.post("/guilds/{guild_id}/join")
async def join_guild(
    guild_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Join a guild"""
    guild = await db.guilds.find_one({"id": guild_id})
    
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    if current_user.id in guild.get("member_ids", []):
        return {"success": True, "message": "Already a member"}
    
    await db.guilds.update_one(
        {"id": guild_id},
        {"$addToSet": {"member_ids": current_user.id}}
    )
    
    return {"success": True, "message": "Joined guild"}
