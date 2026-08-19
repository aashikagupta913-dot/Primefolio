from typing import Any, Optional, Dict, List
from supabase import create_client, Client
from app.core.config import settings
from app.core.exceptions import DatabaseException

class SupabaseService:
    def __init__(self):
        # Create client using URL and Service Role Key (allows bypass of RLS for admin tasks if needed)
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    # ---------------------------------------------------------
    # STORAGE OPERATIONS
    # ---------------------------------------------------------
    def upload_file(self, bucket_id: str, file_path: str, file_content: bytes, content_type: str) -> str:
        """
        Uploads a raw file to a Supabase storage bucket.
        Returns the public/private file URL.
        """
        try:
            # Check if file exists, overwrite if needed.
            # In Supabase storage-py, upload is done via storage.from_().upload()
            res = self.client.storage.from_(bucket_id).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            # Fetch URL
            if bucket_id == "generated-assets":
                return self.client.storage.from_(bucket_id).get_public_url(file_path)
            else:
                # Private file path or signed URL
                return file_path
        except Exception as e:
            raise DatabaseException(f"Failed to upload file to storage: {str(e)}")

    def download_file(self, bucket_id: str, file_path: str) -> bytes:
        """
        Downloads a file from a storage bucket.
        """
        try:
            return self.client.storage.from_(bucket_id).download(file_path)
        except Exception as e:
            raise DatabaseException(f"Failed to download file from storage: {str(e)}")

    # ---------------------------------------------------------
    # RESUMES TABLE OPERATIONS
    # ---------------------------------------------------------
    def create_resume_record(self, user_id: str, file_name: str, file_path: str) -> Dict[str, Any]:
        try:
            res = self.client.table("resumes").insert({
                "user_id": user_id,
                "file_name": file_name,
                "file_path": file_path
            }).execute()
            if not res.data:
                raise DatabaseException("Failed to insert resume record.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error during resume creation: {str(e)}")

    def get_resume_record(self, resume_id: str) -> Dict[str, Any]:
        try:
            res = self.client.table("resumes").select("*").eq("id", resume_id).execute()
            if not res.data:
                raise DatabaseException("Resume record not found", status_code=404)
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error fetching resume: {str(e)}")

    def update_resume_data(self, resume_id: str, raw_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = self.client.table("resumes").update({
                "raw_text": raw_text,
                "parsed_data": parsed_data
            }).eq("id", resume_id).execute()
            if not res.data:
                raise DatabaseException("Failed to update resume record.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error during resume update: {str(e)}")

    # ---------------------------------------------------------
    # THEMES TABLE OPERATIONS
    # ---------------------------------------------------------
    def get_themes(self) -> List[Dict[str, Any]]:
        try:
            res = self.client.table("themes").select("*").execute()
            return res.data or []
        except Exception as e:
            raise DatabaseException(f"Database error fetching themes: {str(e)}")

    def get_theme_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        try:
            res = self.client.table("themes").select("*").eq("slug", slug).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            raise DatabaseException(f"Database error fetching theme: {str(e)}")

    def get_theme_by_id(self, theme_id: str) -> Optional[Dict[str, Any]]:
        try:
            res = self.client.table("themes").select("*").eq("id", theme_id).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            raise DatabaseException(f"Database error fetching theme by id: {str(e)}")

    # ---------------------------------------------------------
    # PORTFOLIOS TABLE OPERATIONS
    # ---------------------------------------------------------
    def create_portfolio(self, user_id: str, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            portfolio_data["user_id"] = user_id
            res = self.client.table("portfolios").insert(portfolio_data).execute()
            if not res.data:
                raise DatabaseException("Failed to create portfolio record.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error during portfolio creation: {str(e)}")

    def get_portfolio(self, portfolio_id: str) -> Dict[str, Any]:
        try:
            res = self.client.table("portfolios").select("*").eq("id", portfolio_id).execute()
            if not res.data:
                raise DatabaseException("Portfolio not found", status_code=404)
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error fetching portfolio: {str(e)}")

    def update_portfolio(self, portfolio_id: str, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = self.client.table("portfolios").update(updates).eq("id", portfolio_id).eq("user_id", user_id).execute()
            if not res.data:
                raise DatabaseException("Portfolio not found or unauthorized to update.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error updating portfolio: {str(e)}")

    # ---------------------------------------------------------
    # SCRIPTS TABLE OPERATIONS
    # ---------------------------------------------------------
    def create_script(self, user_id: str, portfolio_id: str, title: str, script_text: str, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            res = self.client.table("generated_scripts").insert({
                "user_id": user_id,
                "portfolio_id": portfolio_id,
                "title": title,
                "script_text": script_text,
                "scenes": scenes
            }).execute()
            if not res.data:
                raise DatabaseException("Failed to save script.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error creating script: {str(e)}")

    def get_script(self, script_id: str) -> Dict[str, Any]:
        try:
            res = self.client.table("generated_scripts").select("*").eq("id", script_id).execute()
            if not res.data:
                raise DatabaseException("Script not found", status_code=404)
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error fetching script: {str(e)}")

    # ---------------------------------------------------------
    # VIDEO JOBS OPERATIONS
    # ---------------------------------------------------------
    def create_video_job(self, user_id: str, script_id: str, avatar_id: str, voice_id: str) -> Dict[str, Any]:
        try:
            res = self.client.table("video_jobs").insert({
                "user_id": user_id,
                "script_id": script_id,
                "avatar_id": avatar_id,
                "voice_id": voice_id,
                "status": "pending"
            }).execute()
            if not res.data:
                raise DatabaseException("Failed to initialize video job.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error creating video job: {str(e)}")

    def update_video_job(self, job_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = self.client.table("video_jobs").update(updates).eq("id", job_id).execute()
            if not res.data:
                raise DatabaseException("Failed to update video job.")
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error updating video job: {str(e)}")

    def get_video_job(self, job_id: str) -> Dict[str, Any]:
        try:
            res = self.client.table("video_jobs").select("*").eq("id", job_id).execute()
            if not res.data:
                raise DatabaseException("Video job not found", status_code=404)
            return res.data[0]
        except Exception as e:
            raise DatabaseException(f"Database error fetching video job: {str(e)}")

    def delete_portfolio(self, portfolio_id: str, user_id: str) -> None:
        try:
            res = self.client.table("portfolios").delete().eq("id", portfolio_id).eq("user_id", user_id).execute()
            if not res.data:
                raise DatabaseException("Portfolio not found or unauthorized to delete.", status_code=404)
        except DatabaseException:
            raise
        except Exception as e:
            raise DatabaseException(f"Database error deleting portfolio: {str(e)}")

    # ---------------------------------------------------------
    # USER DASHBOARD SUMMARY
    # ---------------------------------------------------------
    def get_user_dashboard(self, user_id: str) -> Dict[str, Any]:
        try:
            resumes = self.client.table("resumes").select("id, file_name, created_at").eq("user_id", user_id).execute()
            portfolios = self.client.table("portfolios").select("id, title, subdomain, is_published, created_at").eq("user_id", user_id).execute()
            scripts = self.client.table("generated_scripts").select("id, title, created_at").eq("user_id", user_id).execute()
            video_jobs = self.client.table("video_jobs").select("id, status, video_url, created_at").eq("user_id", user_id).execute()

            return {
                "resumes": resumes.data or [],
                "portfolios": portfolios.data or [],
                "scripts": scripts.data or [],
                "video_jobs": video_jobs.data or []
            }
        except Exception as e:
            raise DatabaseException(f"Database error fetching dashboard metrics: {str(e)}")

# Global Singleton
supabase_service = SupabaseService()
