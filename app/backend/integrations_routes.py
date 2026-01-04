from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserInDB
from dependencies import get_db, get_current_active_user
from advanced_models import WebhookModel, IntegrationModel
from datetime import datetime, timezone
import httpx

router = APIRouter(prefix="/integrations", tags=["integrations"])

# ==================== WEBHOOKS ====================

@router.post("/webhooks")
async def create_webhook(
    name: str,
    url: str,
    events: list,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a webhook"""
    webhook = WebhookModel(
        user_id=current_user.id,
        name=name,
        url=url,
        events=events
    )
    
    doc = webhook.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.webhooks.insert_one(doc)
    
    return {"success": True, "webhook_id": webhook.id}

@router.get("/webhooks")
async def get_webhooks(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's webhooks"""
    webhooks = await db.webhooks.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    return {"webhooks": webhooks}

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a webhook"""
    result = await db.webhooks.delete_one({
        "id": webhook_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    return {"success": True}

# ==================== INTEGRATIONS ====================

@router.get("/available")
async def get_available_integrations():
    """Get list of available integrations"""
    return {
        "integrations": [
            {"id": "google_calendar", "name": "Google Calendar", "icon": "📅", "status": "mock"},
            {"id": "notion", "name": "Notion", "icon": "📝", "status": "mock"},
            {"id": "spotify", "name": "Spotify", "icon": "🎵", "status": "mock"},
            {"id": "strava", "name": "Strava", "icon": "🏃", "status": "mock"},
            {"id": "todoist", "name": "Todoist", "icon": "✅", "status": "mock"},
            {"id": "trello", "name": "Trello", "icon": "📋", "status": "mock"},
        ]
    }

@router.post("/connect/{provider}")
async def connect_integration(
    provider: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Connect an integration (mocked)"""
    integration = IntegrationModel(
        user_id=current_user.id,
        provider=provider,
        settings={"mock": True}
    )
    
    doc = integration.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('expires_at'):
        doc['expires_at'] = doc['expires_at'].isoformat()
    
    await db.integrations.insert_one(doc)
    
    return {
        "success": True,
        "message": f"{provider} connecté (mode mock)",
        "integration_id": integration.id
    }

@router.get("/connected")
async def get_connected_integrations(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's connected integrations"""
    integrations = await db.integrations.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    return {"integrations": integrations}
