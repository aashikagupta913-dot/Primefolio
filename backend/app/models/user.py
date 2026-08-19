from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

class DashboardResumeItem(BaseModel):
    id: str
    file_name: str
    created_at: str

class DashboardPortfolioItem(BaseModel):
    id: str
    title: str
    subdomain: Optional[str] = None
    is_published: bool
    created_at: str

class DashboardScriptItem(BaseModel):
    id: str
    title: str
    created_at: str

class DashboardVideoJobItem(BaseModel):
    id: str
    status: str
    video_url: Optional[str] = None
    created_at: str

class DashboardResponse(BaseModel):
    resumes: List[DashboardResumeItem] = []
    portfolios: List[DashboardPortfolioItem] = []
    scripts: List[DashboardScriptItem] = []
    video_jobs: List[DashboardVideoJobItem] = []
