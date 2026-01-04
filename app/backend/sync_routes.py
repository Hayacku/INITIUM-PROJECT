from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from models import UserInDB
from dependencies import get_db, get_current_active_user
import uuid

router = APIRouter(prefix="/sync", tags=["synchronization"])

# ==================== SYNC MODELS ====================

class SyncDataModel(BaseModel):
    """Generic model for syncing any collection data"""
    collection: str  # quests, habits, projects, tasks, notes, training, events, analytics, badges
    data: List[Dict[str, Any]]
    last_sync: Optional[datetime] = None

class SyncResponse(BaseModel):
    success: bool
    synced_count: int
    message: str

class PullResponse(BaseModel):
    success: bool
    data: Dict[str, List[Dict[str, Any]]]  # Collection name -> list of documents
    last_sync: datetime

# ==================== PUSH TO CLOUD ====================

@router.post("/push", response_model=SyncResponse)
async def push_to_cloud(
    sync_data: SyncDataModel,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Push local data to cloud MongoDB
    Upserts documents based on 'id' field
    """
    collection_name = sync_data.collection
    
    # Validate collection name
    allowed_collections = [
        'quests', 'habits', 'projects', 'tasks', 'notes', 
        'training', 'events', 'analytics', 'badges'
    ]
    
    if collection_name not in allowed_collections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid collection name. Allowed: {allowed_collections}"
        )
    
    collection = db[collection_name]
    synced_count = 0
    
    # Add user_id to all documents
    for doc in sync_data.data:
        doc['user_id'] = current_user.id
        doc['synced_at'] = datetime.now(timezone.utc).isoformat()
        
        # Convert datetime objects to ISO strings if present
        for key, value in doc.items():
            if isinstance(value, datetime):
                doc[key] = value.isoformat()
        
        # Upsert based on 'id' field
        if 'id' in doc:
            await collection.update_one(
                {'id': doc['id'], 'user_id': current_user.id},
                {'$set': doc},
                upsert=True
            )
            synced_count += 1
        else:
            # If no id, create new document with generated id
            doc['id'] = str(uuid.uuid4())
            await collection.insert_one(doc)
            synced_count += 1
    
    return SyncResponse(
        success=True,
        synced_count=synced_count,
        message=f"Successfully synced {synced_count} {collection_name} to cloud"
    )

# ==================== PULL FROM CLOUD ====================

@router.get("/pull", response_model=PullResponse)
async def pull_from_cloud(
    collections: Optional[str] = None,  # Comma-separated list, e.g., "quests,habits"
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Pull user's data from cloud MongoDB
    Returns all collections or specific ones
    """
    allowed_collections = [
        'quests', 'habits', 'projects', 'tasks', 'notes', 
        'training', 'events', 'analytics', 'badges'
    ]
    
    # Determine which collections to pull
    if collections:
        collections_to_pull = [c.strip() for c in collections.split(',')]
        collections_to_pull = [c for c in collections_to_pull if c in allowed_collections]
    else:
        collections_to_pull = allowed_collections
    
    result_data = {}
    
    for collection_name in collections_to_pull:
        collection = db[collection_name]
        
        # Fetch user's documents
        docs = await collection.find(
            {'user_id': current_user.id},
            {'_id': 0}  # Exclude MongoDB _id
        ).to_list(10000)
        
        # Convert ISO strings back to datetime if needed (optional, client handles this)
        result_data[collection_name] = docs
    
    return PullResponse(
        success=True,
        data=result_data,
        last_sync=datetime.now(timezone.utc)
    )

# ==================== BULK SYNC (MIGRATE ALL) ====================

@router.post("/migrate", response_model=Dict[str, Any])
async def migrate_all_data(
    all_data: Dict[str, List[Dict[str, Any]]],
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Migrate all local IndexedDB data to cloud in one go
    Accepts a dict with collection names as keys
    """
    allowed_collections = [
        'quests', 'habits', 'projects', 'tasks', 'notes', 
        'training', 'events', 'analytics', 'badges'
    ]
    
    results = {}
    total_synced = 0
    
    for collection_name, documents in all_data.items():
        if collection_name not in allowed_collections:
            results[collection_name] = {
                'success': False,
                'message': 'Invalid collection name'
            }
            continue
        
        collection = db[collection_name]
        synced_count = 0
        
        for doc in documents:
            doc['user_id'] = current_user.id
            doc['synced_at'] = datetime.now(timezone.utc).isoformat()
            
            # Convert datetime objects to ISO strings
            for key, value in doc.items():
                if isinstance(value, datetime):
                    doc[key] = value.isoformat()
            
            if 'id' in doc:
                await collection.update_one(
                    {'id': doc['id'], 'user_id': current_user.id},
                    {'$set': doc},
                    upsert=True
                )
                synced_count += 1
            else:
                doc['id'] = str(uuid.uuid4())
                await collection.insert_one(doc)
                synced_count += 1
        
        results[collection_name] = {
            'success': True,
            'synced_count': synced_count,
            'message': f'Synced {synced_count} documents'
        }
        total_synced += synced_count
    
    return {
        'success': True,
        'total_synced': total_synced,
        'collections': results,
        'message': f'Successfully migrated {total_synced} total documents'
    }

# ==================== DELETE USER DATA ====================

@router.delete("/clear")
async def clear_cloud_data(
    collections: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Clear user's data from cloud (specific collections or all)
    Use with caution!
    """
    allowed_collections = [
        'quests', 'habits', 'projects', 'tasks', 'notes', 
        'training', 'events', 'analytics', 'badges'
    ]
    
    if collections:
        collections_to_clear = [c.strip() for c in collections.split(',')]
        collections_to_clear = [c for c in collections_to_clear if c in allowed_collections]
    else:
        collections_to_clear = allowed_collections
    
    deleted_counts = {}
    
    for collection_name in collections_to_clear:
        collection = db[collection_name]
        result = await collection.delete_many({'user_id': current_user.id})
        deleted_counts[collection_name] = result.deleted_count
    
    return {
        'success': True,
        'deleted_counts': deleted_counts,
        'message': 'Data cleared successfully'
    }
