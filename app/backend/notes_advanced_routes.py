from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserInDB
from dependencies import get_db, get_current_active_user
from advanced_models import BacklinkModel, NoteTemplateModel
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/notes-advanced", tags=["notes-advanced"])

# ==================== BACKLINKS ====================

@router.get("/backlinks/{note_id}")
async def get_backlinks(
    note_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all backlinks for a note"""
    backlinks = await db.backlinks.find(
        {"target_id": note_id, "user_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    return {"backlinks": backlinks}

@router.post("/backlinks")
async def create_backlink(
    source_id: str,
    target_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a backlink between notes"""
    # Check if backlink already exists
    existing = await db.backlinks.find_one({
        "source_id": source_id,
        "target_id": target_id,
        "user_id": current_user.id
    })
    
    if existing:
        return {"success": True, "message": "Backlink already exists"}
    
    backlink = BacklinkModel(
        source_id=source_id,
        target_id=target_id,
        user_id=current_user.id
    )
    
    doc = backlink.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user.id
    
    await db.backlinks.insert_one(doc)
    
    return {"success": True, "backlink_id": backlink.id}

# ==================== TEMPLATES ====================

PREDEFINED_TEMPLATES = [
    {
        "name": "GTD - Getting Things Done",
        "category": "GTD",
        "content": "# Projet: [[Nom du Projet]]\n\n## Inbox\n- [ ] \n\n## Next Actions\n- [ ] \n\n## Projects\n- [ ] \n\n## Waiting For\n- [ ] \n\n## Someday/Maybe\n- [ ] "
    },
    {
        "name": "Cornell Notes",
        "category": "Cornell",
        "content": "# Sujet: \n**Date**: \n\n## Cue Column (Questions)\n- \n\n## Notes Column\n\n\n## Summary\n"
    },
    {
        "name": "Zettelkasten Note",
        "category": "Zettelkasten",
        "content": "# [[Title]]\n\n## Main Idea\n\n\n## Related Notes\n- [[]]\n\n## References\n- \n\n## Tags\n#"
    },
    {
        "name": "Meeting Notes",
        "category": "Meeting",
        "content": "# Meeting: \n**Date**: \n**Attendees**: \n\n## Agenda\n1. \n\n## Discussion\n\n\n## Action Items\n- [ ] \n\n## Next Steps\n"
    },
]

@router.get("/templates")
async def get_templates(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all note templates"""
    # Get predefined templates
    templates = PREDEFINED_TEMPLATES.copy()
    
    # Get user's custom templates
    custom = await db.note_templates.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    return {"predefined": templates, "custom": custom}

@router.post("/templates")
async def create_template(
    name: str,
    content: str,
    category: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a custom template"""
    template = NoteTemplateModel(
        user_id=current_user.id,
        name=name,
        content=content,
        category=category
    )
    
    doc = template.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.note_templates.insert_one(doc)
    
    return {"success": True, "template_id": template.id}
