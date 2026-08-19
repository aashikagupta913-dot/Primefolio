from fastapi import APIRouter, Depends, Request, Body
from pydantic import BaseModel
from typing import Any, Dict, Optional

from app.api.deps import get_current_user
from app.services.supabase_service import supabase_service
from app.services.ai_service import ai_service
from app.core.exceptions import AppException, AuthException
from app.core.security import verify_supabase_token
from app.models.portfolio import PortfolioUpdate

router = APIRouter()

def convert_old_schema_to_new(old_config: dict, parsed_data: dict) -> dict:
    if not old_config:
        return old_config
        
    # Check if this is the old schema format
    if "style" in old_config or "color_palette" in old_config or "section_order" in old_config:
        print(f"[DEBUG] Converting old schema portfolio config to new schema format. Old config keys: {list(old_config.keys())}")
        
        palette = old_config.get("color_palette", {})
        primary = palette.get("primary", "#818cf8")
        secondary = palette.get("secondary", "#a78bfa")
        
        new_config = {
            "siteTitle": f"{parsed_data.get('full_name', 'Alex Mercer')} | Portfolio",
            "tagline": old_config.get("tagline") or "Building scalable web engines and intelligent cloud architectures.",
            "theme": old_config.get("style") or old_config.get("theme") or "Midnight Neon",
            "primaryColor": primary,
            "secondaryColor": secondary,
            "typography": "Space Grotesk",
            "animationStyle": "fade-in-up",
            "heroSection": {
                "headline": old_config.get("hero_headline") or f"Building Scalable Futures with {parsed_data.get('full_name', 'Alex Mercer')}",
                "subheadline": old_config.get("tagline") or "Full Stack Engineer specializing in FastAPI, React, and cloud architectures.",
                "ctaText": "Get in Touch",
                "backgroundImage": ""
            },
            "aboutSection": {
                "title": "About Me",
                "description": old_config.get("professional_summary") or f"Hi, I'm {parsed_data.get('full_name', 'Alex Mercer')}. I specialize in backend FastAPI services, Supabase cloud databases, and React frontends.",
                "bioParagraphs": [
                    old_config.get("professional_summary") or "I am a software engineer passionate about clean code, performance optimization, and accessible UI components."
                ],
                "profileImage": ""
            },
            "skillsSection": {
                "title": "My Skills",
                "categories": [
                    {
                        "name": "Design & UI",
                        "items": [s for group in parsed_data.get("skills", []) if group.get("category") == "Design & UI" for s in group.get("skills", [])] or ["React", "TypeScript", "Tailwind CSS"]
                    },
                    {
                        "name": "Logic",
                        "items": [s for group in parsed_data.get("skills", []) if group.get("category") != "Design & UI" for s in group.get("skills", [])] or ["FastAPI", "Python", "PostgreSQL"]
                    }
                ]
            },
            "projectsSection": {
                "title": "Featured Projects",
                "items": [
                    {
                        "title": p.get("name") or p.get("title", ""),
                        "description": p.get("description", ""),
                        "technologies": p.get("technologies", []),
                        "link": p.get("url") or p.get("link", ""),
                        "role": p.get("role", "")
                    }
                    for p in parsed_data.get("projects", [])
                ] or [
                    {
                        "title": "AI Auto-Portfolio Builder",
                        "description": "A system that ingests resumes and generates interactive developer portfolios and avatar scripts.",
                        "technologies": ["FastAPI", "React", "Supabase"],
                        "link": "",
                        "role": "Lead Architect"
                    }
                ]
            },
            "experienceSection": {
                "title": "Work Experience",
                "items": [
                    {
                        "role": e.get("position") or e.get("role", ""),
                        "company": e.get("company", ""),
                        "duration": f"{e.get('start_date', '')} - {e.get('end_date', '')}",
                        "achievements": e.get("achievements", []),
                        "description": e.get("description", "")
                    }
                    for e in parsed_data.get("experience", [])
                ] or [
                    {
                        "role": "Senior Software Engineer",
                        "company": "TechNova Solutions",
                        "duration": "Jan 2022 - Present",
                        "achievements": [
                            "Reduced database query latency by 40% through index optimization.",
                            "Architected scalable microservices using FastAPI and Docker containers."
                        ],
                        "description": "Led the development of a real-time analytics dashboard."
                    }
                ]
            },
            "contactSection": {
                "title": "Let's Connect",
                "description": "Feel free to reach out for collaborations, project requests, or just to say hello!",
                "email": parsed_data.get("email") or "alex.mercer@gmail.com",
                "socialLinks": {
                    "github": "https://github.com",
                    "linkedin": "https://linkedin.com",
                    "twitter": "https://twitter.com"
                }
            },
            "sectionOrder": ["aboutSection", "skillsSection", "projectsSection", "experienceSection", "contactSection"]
        }
        
        for key in ["ai_source", "raw_prompt", "raw_groq_response", "model_name", "token_usage"]:
            if key in old_config:
                new_config[key] = old_config[key]
                
        print(f"[DEBUG] Conversion successful. New config keys: {list(new_config.keys())}")
        return new_config
        
    return old_config

class GeneratePortfolioRequest(BaseModel):
    resume_id: str
    mode: str = "template"
    theme_slug: Optional[str] = "minimalist"
    subdomain: Optional[str] = None
    user_instructions: Optional[str] = None

@router.post("/generate")
async def generate_portfolio(
    payload: GeneratePortfolioRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Takes parsed resume profile, calls Gemini AI to build tailored copywriting,
    resolves theme templates or AI styling decisions, and saves a portfolio record.
    """
    user_id = current_user.get("user_id")
    resume_id = payload.resume_id
    mode = payload.mode
    theme_slug = payload.theme_slug
    user_instructions = payload.user_instructions or ""

    # 1. Fetch resume profile
    resume_rec = supabase_service.get_resume_record(resume_id)
    if resume_rec.get("user_id") != user_id:
        raise AuthException("Unauthorized access to this resume.", status_code=403)
        
    parsed_data = resume_rec.get("parsed_data")
    if not parsed_data:
        raise AppException("Resume has not been parsed yet. Run parser first.", status_code=400)

    # Determine workflow details based on mode
    theme_id = None
    ai_generated_config = None

    if mode == "ai":
        # 2. AI flow - Ask Qwen to make design/layout and content decisions based on parsed profile and user_instructions
        ai_portfolio = ai_service.generate_portfolio_config_ai(parsed_data, user_instructions)
        
        # Add debugging logs showing Raw response and Parsed response
        print(f"[DEBUG] Raw Groq response obtained in API: {ai_portfolio.get('raw_groq_response', 'N/A')[:200]}...")
        print(f"[DEBUG] Parsed Groq response obtained in API (keys): {list(ai_portfolio.keys())}")
        
        # Auto-convert if old schema fallback detected
        ai_portfolio = convert_old_schema_to_new(ai_portfolio, parsed_data)
        ai_generated_config = ai_portfolio
        
        # Extract column values from blueprint
        title_val = ai_portfolio.get("siteTitle") or f"{parsed_data.get('full_name', 'User')}'s Portfolio"
        tagline_val = ai_portfolio.get("tagline")
        about_val = ai_portfolio.get("aboutSection", {}).get("description")
        skills_val = ai_portfolio.get("skillsSection", {}).get("categories", [])
        experience_val = ai_portfolio.get("experienceSection", {}).get("items", [])
        projects_val = ai_portfolio.get("projectsSection", {}).get("items", [])
        email_val = ai_portfolio.get("contactSection", {}).get("email")
        social_val = ai_portfolio.get("contactSection", {}).get("socialLinks", {})
    else:
        # 2. Template flow - Get predefined theme configuration
        theme = supabase_service.get_theme_by_slug(theme_slug or "minimalist")
        theme_id = theme.get("id") if theme else None
        ai_portfolio = ai_service.generate_portfolio_config(parsed_data, theme_slug or "minimalist")
        
        title_val = ai_portfolio.get("title")
        tagline_val = ai_portfolio.get("tagline")
        about_val = ai_portfolio.get("about")
        skills_val = ai_portfolio.get("skills", [])
        experience_val = ai_portfolio.get("experience", [])
        projects_val = ai_portfolio.get("projects", [])
        email_val = ai_portfolio.get("contact_email")
        social_val = ai_portfolio.get("social_links", {})

    # 3. Prepare database document
    portfolio_document = {
        "resume_id": resume_id,
        "theme_id": theme_id,
        "subdomain": payload.subdomain or f"{parsed_data.get('full_name', 'user').lower().replace(' ', '-')}-{resume_id[:4]}",
        "title": title_val,
        "tagline": tagline_val,
        "about": about_val,
        "contact_email": email_val,
        "skills": skills_val,
        "experience": experience_val,
        "projects": projects_val,
        "education": parsed_data.get("education", []) if mode == "template" else [], # Qwen blueprint doesn't use educationSection
        "social_links": social_val,
        "is_published": False,  # defaults to draft mode
        "selected_generation_mode": mode,
        "selected_theme": theme_slug if mode == "template" else None,
        "ai_generated_config": ai_generated_config
    }

    # 4. Save to database
    new_portfolio = supabase_service.create_portfolio(user_id, portfolio_document)

    return {
        "success": True,
        "portfolio": new_portfolio
    }

@router.get("/{portfolio_id}")
async def get_portfolio(portfolio_id: str, request: Request):
    """
    Publicly accessible endpoint to fetch published portfolios.
    Draft portfolios are restricted to their authenticated owners.
    """
    # Parse authorization header if present
    viewer_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                user_info = verify_supabase_token(parts[1])
                viewer_id = user_info.get("user_id")
        except Exception:
            pass # Suppress failures and treat as anonymous visitor

    # Fetch portfolio
    portfolio = supabase_service.get_portfolio(portfolio_id)
    
    # Restrict read if draft and not owner
    if not portfolio.get("is_published") and portfolio.get("user_id") != viewer_id:
        raise AuthException("Access denied. This portfolio is unpublished.", status_code=403)
        
    # Append theme configuration details if theme_id is present
    if portfolio.get("theme_id"):
        try:
            theme = supabase_service.get_theme_by_id(portfolio.get("theme_id"))
            portfolio["theme"] = theme
        except Exception:
            pass

    # Normalize AI Generated Config if present to ensure 100% dynamic renderer compliance
    if portfolio.get("selected_generation_mode") == "ai" and portfolio.get("ai_generated_config"):
        parsed_data = {
            "full_name": portfolio.get("title", "Alex Mercer").split("|")[0].strip(),
            "email": portfolio.get("contact_email"),
            "skills": portfolio.get("skills", []),
            "experience": portfolio.get("experience", []),
            "projects": portfolio.get("projects", []),
            "education": portfolio.get("education", [])
        }
        portfolio["ai_generated_config"] = convert_old_schema_to_new(portfolio["ai_generated_config"], parsed_data)
        print(f"[DEBUG] Saved ai_generated_config served to client: {list(portfolio['ai_generated_config'].keys())}")

    return portfolio

@router.put("/{portfolio_id}")
async def update_portfolio(
    portfolio_id: str,
    payload: PortfolioUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Updates the portfolio configuration (e.g., bio changes, theme switches, or publication toggle).
    """
    user_id = current_user.get("user_id")
    
    # Remove unsupplied fields
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    # Perform update
    updated_portfolio = supabase_service.update_portfolio(portfolio_id, user_id, update_data)
    
    return {
        "success": True,
        "portfolio": updated_portfolio
    }

@router.get("/themes/list")
async def list_themes():
    """
    Returns lists of predefined design templates/themes.
    """
    themes = supabase_service.get_themes()
    return {
        "success": True,
        "themes": themes
    }

@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deletes a portfolio owned by the user.
    """
    user_id = current_user.get("user_id")
    supabase_service.delete_portfolio(portfolio_id, user_id)
    return {
        "success": True,
        "message": "Portfolio deleted successfully."
    }
