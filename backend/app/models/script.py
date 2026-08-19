from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class SceneItem(BaseModel):
    scene_number: int = Field(..., description="Order sequence of the video scene")
    visual_prompt: str = Field(..., description="Instructions on what to show visually (e.g. avatar, code screen, project slide)")
    voiceover: str = Field(..., description="The spoken text script for the AI voice narrator / avatar")

class ScriptCreate(BaseModel):
    portfolio_id: str = Field(..., description="The portfolio configuration ID to generate the script from")
    title: str = Field("Intro Video Script", description="Title of this video script version")

class ScriptResponse(BaseModel):
    id: str
    portfolio_id: str
    user_id: str
    title: str
    script_text: str
    scenes: List[SceneItem]
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)
