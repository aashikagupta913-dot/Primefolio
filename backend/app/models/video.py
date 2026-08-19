from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class VideoJobCreate(BaseModel):
    script_id: str = Field(..., description="The ID of the generated script to render")
    avatar_id: Optional[str] = Field("default-avatar", description="Optional avatar profile key (e.g. 'anthony_casual')")
    voice_id: Optional[str] = Field("default-voice", description="Optional voice tone index (e.g. 'en-US-Standard-C')")

class VideoJobResponse(BaseModel):
    id: str
    user_id: str
    script_id: Optional[str] = None
    status: str = Field("pending", description="Current execution state: pending, processing, completed, failed")
    error_message: Optional[str] = None
    video_url: Optional[str] = None
    avatar_id: Optional[str] = None
    voice_id: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)
