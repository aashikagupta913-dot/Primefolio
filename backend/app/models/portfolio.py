from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class PortfolioCreate(BaseModel):
    title: str = Field(..., description="Title of the portfolio website")
    resume_id: Optional[str] = Field(None, description="Reference to the resume ID used to generate this")
    theme_id: Optional[str] = Field(None, description="Theme mapping ID")
    subdomain: Optional[str] = Field(None, description="Desired subdomain for hosting (e.g. 'john-doe')")

class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    about: Optional[str] = None
    profile_image_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    social_links: Optional[Dict[str, str]] = None
    skills: Optional[List[Dict[str, Any]]] = None # Can be list of SkillGroup representation
    experience: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    is_published: Optional[bool] = None
    theme_id: Optional[str] = None
    selected_generation_mode: Optional[str] = None
    selected_theme: Optional[str] = None
    ai_generated_config: Optional[Dict[str, Any]] = None

class PortfolioResponse(BaseModel):
    id: str
    user_id: str
    resume_id: Optional[str] = None
    theme_id: Optional[str] = None
    subdomain: Optional[str] = None
    title: str
    tagline: Optional[str] = None
    about: Optional[str] = None
    profile_image_url: Optional[str] = None
    contact_email: Optional[str] = None
    social_links: Dict[str, str] = {}
    skills: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    is_published: bool
    selected_generation_mode: Optional[str] = None
    selected_theme: Optional[str] = None
    ai_generated_config: Optional[Dict[str, Any]] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)
