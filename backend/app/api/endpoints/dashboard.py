from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Gathers metrics and summaries for the authenticated user's dashboard.
    """
    user_id = current_user.get("user_id")
    data = supabase_service.get_user_dashboard(user_id)
    
    resumes = data.get("resumes", [])
    portfolios = data.get("portfolios", [])
    scripts = data.get("scripts", [])
    video_jobs = data.get("video_jobs", [])
    
    # Compile stats
    return {
        "success": True,
        "stats": {
            "resume_count": len(resumes),
            "portfolio_count": len(portfolios),
            "script_count": len(scripts),
            "video_job_count": len(video_jobs)
        },
        "resumes": resumes,
        "portfolios": portfolios,
        "scripts": scripts,
        "video_jobs": video_jobs
    }
