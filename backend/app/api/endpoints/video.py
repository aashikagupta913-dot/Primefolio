from fastapi import APIRouter, Depends, BackgroundTasks
from app.api.deps import get_current_user
from app.services.supabase_service import supabase_service
from app.services.video_service import video_service
from app.models.video import VideoJobCreate
from app.core.exceptions import AuthException

router = APIRouter()

@router.post("/generate")
async def generate_video(
    payload: VideoJobCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Submits a video rendering request for background generation.
    """
    user_id = current_user.get("user_id")
    script_id = payload.script_id

    # 1. Verify script ownership
    script = supabase_service.get_script(script_id)
    if script.get("user_id") != user_id:
        raise AuthException("Unauthorized access to this script.", status_code=403)

    # 2. Insert video job record into DB
    job_record = supabase_service.create_video_job(
        user_id=user_id,
        script_id=script_id,
        avatar_id=payload.avatar_id or "default-avatar",
        voice_id=payload.voice_id or "default-voice"
    )
    job_id = job_record.get("id")

    # 3. Schedule async job execution
    background_tasks.add_task(
        video_service.render_video_async,
        job_id=job_id,
        script_id=script_id,
        avatar_id=payload.avatar_id or "default-avatar",
        voice_id=payload.voice_id or "default-voice"
    )

    return {
        "success": True,
        "message": "Video rendering job submitted successfully.",
        "job": job_record
    }

@router.get("/job/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Checks the status of an ongoing video rendering job.
    """
    user_id = current_user.get("user_id")
    
    # Retrieve job
    job = supabase_service.get_video_job(job_id)
    
    # Verify owner
    if job.get("user_id") != user_id:
        raise AuthException("Unauthorized access to this job status.", status_code=403)
        
    return job
