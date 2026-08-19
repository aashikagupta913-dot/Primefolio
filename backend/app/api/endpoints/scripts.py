from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.api.deps import get_current_user
from app.services.supabase_service import supabase_service
from app.services.ai_service import ai_service
from app.core.exceptions import AuthException

router = APIRouter()

class GenerateScriptRequest(BaseModel):
    portfolio_id: str
    title: Optional[str] = "Intro Video Script"

@router.post("/generate-script")
async def generate_script(
    payload: GenerateScriptRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Builds video storyboard prompts and narration matching user's portfolio assets.
    """
    user_id = current_user.get("user_id")
    portfolio_id = payload.portfolio_id

    # 1. Verify portfolio exists and is owned by the user
    portfolio = supabase_service.get_portfolio(portfolio_id)
    if portfolio.get("user_id") != user_id:
        raise AuthException("Unauthorized access to this portfolio.", status_code=403)

    # 2. Call AI copywriting engine
    script_data = ai_service.generate_video_script(portfolio)
    
    script_text = script_data.get("script_text", "")
    scenes = script_data.get("scenes", [])

    # 3. Save to database
    script_record = supabase_service.create_script(
        user_id=user_id,
        portfolio_id=portfolio_id,
        title=payload.title or "Intro Video Script",
        script_text=script_text,
        scenes=scenes
    )

    return {
        "success": True,
        "script": script_record
    }
