from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import AsyncOpenAI
import json
from models import UserInDB
from models_axiom import DecisionRequest, ActionAnalysis, ActionImpact, ObjectiveAlignment, DecisionResult
from dependencies import get_current_active_user, get_db

router = APIRouter(prefix="/ai", tags=["ai"])

# Initialize OpenAI Client (Graceful fallback if no key)
api_key = os.environ.get("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """
You are the central "Axiom of Choice" engine for the INITIUM Life OS. 
Your purpose is to analyze user actions without emotion or excuse, prioritizing long-term growth over short-term gratification.

You will receive a user dilemma or action. You must analyze it using the "Directed Axiom" methodology:
1. **Direct Result**: Immediate gains/losses/resource consumption.
2. **Indirect Consequences**: Long-term effects on habits, identity, and systems.
3. **Real Cost**: Visible + Hidden + Opportunity Cost.
4. **Risk**: Probability vs Severity.
5. **Score**: Calculate a weighted score based on alignment with the user's Life Objectives.

Output MUST be valid JSON formatted strictly according to the ActionAnalysis schema provided.
"""

@router.post("/analyze", response_model=DecisionResult)
async def analyze_action(
    request: DecisionRequest,
    current_user: UserInDB = Depends(get_current_active_user),
    db = Depends(get_db)
):
    if not client:
        # Mock Response if no API Key is set
        return DecisionResult(
            user_id=current_user.id,
            context=request.context,
            analyzed_actions=[
                ActionAnalysis(
                    action_name="Simulated Action (No API Key)",
                    impact=ActionImpact(
                        immediate_gain="None",
                        immediate_loss="None",
                        resources_consumed="None",
                        long_term_positive="None",
                        long_term_negative="None",
                        habit_impact="None",
                        identity_impact="None",
                        visible_cost="None",
                        hidden_cost="None",
                        opportunity_cost="None",
                        risk_probability="low",
                        risk_severity=1
                    ),
                    alignments=[],
                    calculated_score=0,
                    is_allowed=True,
                    rejection_reason="OpenAI API Key missing in server environment."
                )
            ],
            winning_action="No Action",
            ai_rationale="Please configure OPENAI_API_KEY in backend .env to enable real analysis."
        )

    # Fetch User Objectives to provide context to the AI
    objectives_cursor = db.objectives.find({"user_id": current_user.id, "is_active": True})
    objectives = await objectives_cursor.to_list(length=20)
    objectives_str = json.dumps([{
        "name": obj["name"], 
        "type": obj["type"], 
        "importance": obj["importance"],
        "horizon": obj["horizon"]
    } for obj in objectives])

    user_query = f"""
    Context/Dilemma: "{request.context}"
    User Voice Transcript: "{request.user_voice_transcript or 'N/A'}"
    
    Current User Objectives:
    {objectives_str}
    
    Analyze this situation. Identify the best action vs alternative.
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_query}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # In a real implementation, we would parse 'data' into the structured Pydantic models with validation.
        # For this prototype, assuming the LLM follows the schema instructions (which we need to provide explicitly in schema format).
        # To ensure robustness, we'll wrap a simple parser here or just return a mock "Real AI" response structure if parsing fails.
        
        # (Simplification for Prototype V1: We return what we get mapped as best as possible)
        # NOTE: Proper Pydantic parsing from loose JSON requires more robust code. 
        # We will assume for now the JSON is structure correctly or fallback.
        
        return DecisionResult(**data) # This assumes the LLM outputs exact DecisionResult structure.

    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Analysis Failed: {str(e)}"
        )
