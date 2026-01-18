from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserInDB
from dependencies import get_db, get_current_active_user
from advanced_models import PomodoroSessionModel
from datetime import datetime, timezone

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])

@router.post("/start")
async def start_pomodoro(
    duration: int = 25,
    task_id: str = None,
    session_type: str = "work",
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Start a pomodoro session"""
    session = PomodoroSessionModel(
        user_id=current_user.id,
        task_id=task_id,
        duration=duration,
        type=session_type
    )
    
    doc = session.model_dump()
    doc['started_at'] = doc['started_at'].isoformat()
    if doc.get('completed_at'):
        doc['completed_at'] = doc['completed_at'].isoformat()
    
    await db.pomodoro_sessions.insert_one(doc)
    
    return {"success": True, "session_id": session.id, "duration": duration}

@router.post("/complete/{session_id}")
async def complete_pomodoro(
    session_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Complete a pomodoro session"""
    await db.pomodoro_sessions.update_one(
        {"id": session_id, "user_id": current_user.id},
        {"$set": {
            "completed": True,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Award XP
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"xp": 10}}
    )
    
    return {"success": True, "xp_earned": 10}

@router.get("/stats")
async def get_pomodoro_stats(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get pomodoro statistics"""
    total = await db.pomodoro_sessions.count_documents({"user_id": current_user.id})
    completed = await db.pomodoro_sessions.count_documents({
        "user_id": current_user.id,
        "completed": True
    })
    
    return {
        "total_sessions": total,
        "completed_sessions": completed,
        "completion_rate": (completed / total * 100) if total > 0 else 0
    }
