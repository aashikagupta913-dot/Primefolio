from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import Any, Dict

from app.api.deps import get_current_user
from app.services.supabase_service import supabase_service
from app.services.parser_service import parser_service
from app.services.ai_service import ai_service
from app.core.exceptions import ParsingException

router = APIRouter()

class ParseResumeRequest(BaseModel):
    resume_id: str

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Uploads a resume file (.pdf, .docx, .txt) to Supabase private storage,
    extracts the raw text, processes it using Gemini AI to structure it into JSON,
    and returns the saved database record.
    """
    user_id = current_user.get("user_id")
    file_bytes = await file.read()
    
    file_name = file.filename
    # Define folder path consistent with storage RLS: {user_id}/{filename}
    storage_path = f"{user_id}/{file_name}"
    
    # 1. Extract text early (validates document format)
    try:
        raw_text = parser_service.extract_text(file_bytes, file_name)
    except Exception as e:
        raise ParsingException(f"Invalid document content: {str(e)}")

    # 2. Upload file to Supabase storage 'resumes' bucket
    content_type = file.content_type or "application/octet-stream"
    supabase_service.upload_file(
        bucket_id="resumes",
        file_path=storage_path,
        file_content=file_bytes,
        content_type=content_type
    )

    # 3. Call Gemini to parse resume structure into standardized JSON schema
    try:
        parsed_profile = ai_service.parse_resume_with_ai(raw_text)
    except Exception as e:
        raise ParsingException(f"AI resume parsing failed: {str(e)}")

    # 4. Save resume record in database
    resume_record = supabase_service.create_resume_record(
        user_id=user_id,
        file_name=file_name,
        file_path=storage_path
    )
    resume_id = resume_record.get("id")

    # 5. Save the extracted text and structured profile JSON to DB
    updated_record = supabase_service.update_resume_data(
        resume_id=resume_id,
        raw_text=raw_text,
        parsed_data=parsed_profile
    )

    return {
        "success": True,
        "message": "Resume uploaded and parsed successfully.",
        "resume": updated_record
    }

@router.post("/parse")
async def parse_resume(
    payload: ParseResumeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Downloads file from storage, extracts text, converts to structured JSON via Gemini.
    Saves and returns the structured profile.
    """
    resume_id = payload.resume_id
    
    # 1. Fetch resume path
    resume_rec = supabase_service.get_resume_record(resume_id)
    
    # Verify ownership
    if resume_rec.get("user_id") != current_user.get("user_id"):
        raise ParsingException("Unauthorized to access this resume record.", status_code=403)
        
    storage_path = resume_rec.get("file_path")
    file_name = resume_rec.get("file_name")

    # 2. Download file from storage
    file_bytes = supabase_service.download_file("resumes", storage_path)

    # 3. Extract text
    raw_text = parser_service.extract_text(file_bytes, file_name)

    # 4. Generate structured profile using Gemini
    parsed_profile = ai_service.parse_resume_with_ai(raw_text)

    # 5. Update DB record with text and profile
    updated_rec = supabase_service.update_resume_data(
        resume_id=resume_id,
        raw_text=raw_text,
        parsed_data=parsed_profile
    )

    return {
        "success": True,
        "resume_id": resume_id,
        "profile": parsed_profile
    }
