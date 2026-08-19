from typing import List, Optional
from pydantic import BaseModel, Field

class EducationItem(BaseModel):
    school: str = Field(description="Name of the university, college, or school")
    degree: Optional[str] = Field(None, description="Degree type (e.g., Bachelor of Science, MS)")
    field_of_study: Optional[str] = Field(None, description="Major or area of study")
    start_date: Optional[str] = Field(None, description="Starting date (e.g., September 2018 or 2018)")
    end_date: Optional[str] = Field(None, description="Completion date or 'Present'")
    description: Optional[str] = Field(None, description="Details or achievements during study")

class ExperienceItem(BaseModel):
    company: str = Field(description="Name of the company or organization")
    position: str = Field(description="Job title or role")
    start_date: Optional[str] = Field(None, description="Starting date")
    end_date: Optional[str] = Field(None, description="Ending date or 'Present'")
    description: Optional[str] = Field(None, description="General description of role and responsibilities")
    achievements: List[str] = Field(default=[], description="Bullet list of notable actions, responsibilities, or metrics")

class ProjectItem(BaseModel):
    name: str = Field(description="Name of the project")
    description: str = Field(description="Comprehensive explanation of what the project does")
    role: Optional[str] = Field(None, description="Role in the project (e.g. Lead Developer)")
    technologies: List[str] = Field(default=[], description="Technologies, programming languages, and frameworks used")
    url: Optional[str] = Field(None, description="Link to codebase, demo, or project website")

class SkillGroup(BaseModel):
    category: str = Field(description="Skill categorizer (e.g., Languages, Frameworks, Cloud, Databases)")
    skills: List[str] = Field(description="List of specific skills within this category")

class ParsedResumeData(BaseModel):
    full_name: str = Field(description="Full name of the candidate")
    email: str = Field(description="Contact email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, country or remote preference")
    summary: Optional[str] = Field(None, description="Short professional bio or summary of qualifications")
    skills: List[SkillGroup] = Field(default=[], description="Skills grouped by category")
    experience: List[ExperienceItem] = Field(default=[], description="Professional employment history")
    projects: List[ProjectItem] = Field(default=[], description="Personal or professional project highlights")
    education: List[EducationItem] = Field(default=[], description="Academic history")
