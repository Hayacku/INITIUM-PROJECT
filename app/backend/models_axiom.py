from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone
import uuid

# Enums
HorizonType = Literal["short", "medium", "long"]
ObjectiveType = Literal["growth", "survival", "optimization", "discipline"]
RiskLevel = Literal["low", "medium", "high"]

# ==================== OBJECTIVES ====================

class ObjectiveBase(BaseModel):
    name: str
    description: Optional[str] = None
    importance: int = Field(..., ge=1, le=10, description="1 to 10 scale")
    horizon: HorizonType
    type: ObjectiveType

class ObjectiveCreate(ObjectiveBase):
    pass

class ObjectiveInDB(ObjectiveBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

# ==================== AXIOM ANALYSIS ====================

class ActionImpact(BaseModel):
    immediate_gain: str
    immediate_loss: str
    resources_consumed: str # JSON string or specific object? keeping string for AI flexibility
    
    long_term_positive: str
    long_term_negative: str
    habit_impact: str
    identity_impact: str
    
    visible_cost: str
    hidden_cost: str
    opportunity_cost: str
    
    risk_probability: RiskLevel
    risk_severity: int = Field(..., ge=1, le=10)

class ObjectiveAlignment(BaseModel):
    objective_id: str
    objective_name: str
    helps_objective: bool
    alignment_score: int = Field(0, ge=0, le=10) # 0-10
    is_long_term_damage: bool = False # For the non-negotiable rule

class ActionAnalysis(BaseModel):
    action_name: str
    impact: ActionImpact
    alignments: List[ObjectiveAlignment]
    
    # Calculated fields
    calculated_score: float = 0.0
    is_allowed: bool = True # False if Non-Negotiable rule is violated
    rejection_reason: Optional[str] = None

# ==================== DECISION REQUEST/RESULT ====================

class DecisionRequest(BaseModel):
    context: str # The user's input/dilemma
    user_voice_transcript: Optional[str] = None

class DecisionResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    context: str
    analyzed_actions: List[ActionAnalysis]
    winning_action: Optional[str] = None
    ai_rationale: str 
