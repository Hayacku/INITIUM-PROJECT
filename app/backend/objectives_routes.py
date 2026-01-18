from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime, timezone
from models_axiom import ObjectiveBase, ObjectiveCreate, ObjectiveInDB
from models import UserInDB
from dependencies import get_db, get_current_active_user
import uuid

router = APIRouter(prefix="/objectives", tags=["objectives"])

@router.post("/", response_model=ObjectiveInDB, status_code=status.HTTP_201_CREATED)
async def create_objective(
    objective: ObjectiveCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new life objective"""
    objective_dict = objective.dict()
    objective_dict["id"] = str(uuid.uuid4())
    objective_dict["user_id"] = current_user.id
    objective_dict["created_at"] = datetime.now(timezone.utc)
    objective_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.objectives.insert_one(objective_dict)
    
    return ObjectiveInDB(**objective_dict)

@router.get("/", response_model=List[ObjectiveInDB])
async def list_objectives(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    active_only: bool = True
):
    """Get all objectives for the current user"""
    query = {"user_id": current_user.id}
    if active_only:
        query["is_active"] = True
    
    objectives = await db.objectives.find(query, {"_id": 0}).to_list(length=100)
    return [ObjectiveInDB(**obj) for obj in objectives]

@router.get("/{objective_id}", response_model=ObjectiveInDB)
async def get_objective(
    objective_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a specific objective"""
    objective = await db.objectives.find_one(
        {"id": objective_id, "user_id": current_user.id},
        {"_id": 0}
    )
    
    if not objective:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Objective not found"
        )
    
    return ObjectiveInDB(**objective)

@router.put("/{objective_id}", response_model=ObjectiveInDB)
async def update_objective(
    objective_id: str,
    objective_update: ObjectiveCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update an existing objective"""
    existing = await db.objectives.find_one(
        {"id": objective_id, "user_id": current_user.id}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Objective not found"
        )
    
    update_dict = objective_update.dict()
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.objectives.update_one(
        {"id": objective_id, "user_id": current_user.id},
        {"$set": update_dict}
    )
    
    updated = await db.objectives.find_one(
        {"id": objective_id, "user_id": current_user.id},
        {"_id": 0}
    )
    
    return ObjectiveInDB(**updated)

@router.delete("/{objective_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_objective(
    objective_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete an objective (soft delete by setting is_active=False)"""
    result = await db.objectives.update_one(
        {"id": objective_id, "user_id": current_user.id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Objective not found"
        )
    
    return None
