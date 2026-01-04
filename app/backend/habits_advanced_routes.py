from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserInDB
from dependencies import get_db, get_current_active_user
from advanced_models import MoodEntryModel, HabitMetricModel
from datetime import datetime, timezone

router = APIRouter(prefix="/habits-advanced", tags=["habits-advanced"])

# ==================== MOOD TRACKING ====================

@router.post("/mood")
async def log_mood(
    mood: str,
    energy_level: int,
    notes: str = None,
    habit_id: str = None,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Log mood entry"""
    mood_entry = MoodEntryModel(
        user_id=current_user.id,
        habit_id=habit_id,
        mood=mood,
        energy_level=energy_level,
        notes=notes
    )
    
    doc = mood_entry.model_dump()
    doc['date'] = doc['date'].isoformat()
    
    await db.mood_entries.insert_one(doc)
    
    return {"success": True, "mood_id": mood_entry.id}

@router.get("/mood")
async def get_mood_history(
    days: int = 30,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get mood history"""
    moods = await db.mood_entries.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("date", -1).limit(days).to_list(days)
    
    return {"moods": moods}

# ==================== CUSTOM METRICS ====================

@router.post("/metrics")
async def log_metric(
    habit_id: str,
    metric_type: str,
    value: float,
    unit: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Log a custom metric for a habit"""
    metric = HabitMetricModel(
        user_id=current_user.id,
        habit_id=habit_id,
        metric_type=metric_type,
        value=value,
        unit=unit
    )
    
    doc = metric.model_dump()
    doc['date'] = doc['date'].isoformat()
    
    await db.habit_metrics.insert_one(doc)
    
    return {"success": True, "metric_id": metric.id}

@router.get("/metrics/{habit_id}")
async def get_metrics(
    habit_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get metrics for a habit"""
    metrics = await db.habit_metrics.find(
        {"user_id": current_user.id, "habit_id": habit_id},
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    
    return {"metrics": metrics}
