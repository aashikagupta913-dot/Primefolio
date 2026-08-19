from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from app.api.deps import get_current_user
from app.services.supabase_service import supabase_service

router = APIRouter()

class UserAuth(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(payload: UserAuth):
    """
    Handles user email/password signup via Supabase Auth.
    """
    try:
        res = supabase_service.client.auth.sign_up({
            "email": payload.email,
            "password": payload.password
        })
        
        # Safe extraction across SDK version differences
        user_id = None
        user_email = None
        
        if hasattr(res, "user") and res.user:
            user_id = str(res.user.id)
            user_email = res.user.email
        elif isinstance(res, dict) and "user" in res:
            user_id = str(res["user"]["id"])
            user_email = res["user"]["email"]
            
        if not user_id:
            raise HTTPException(status_code=400, detail="Signup failed.")
            
        return {
            "success": True,
            "message": "User registered successfully.",
            "user": {
                "id": user_id,
                "email": user_email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(payload: UserAuth):
    """
    Handles user email/password login and returns session JWT.
    """
    try:
        res = supabase_service.client.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        
        token = None
        user_id = None
        user_email = None
        
        if hasattr(res, "session") and res.session:
            token = res.session.access_token
            user_id = str(res.user.id)
            user_email = res.user.email
        elif isinstance(res, dict) and "session" in res:
            token = res["session"]["access_token"]
            user_id = str(res["user"]["id"])
            user_email = res["user"]["email"]
            
        if not token:
            raise HTTPException(status_code=400, detail="Login failed.")
            
        return {
            "success": True,
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user_email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_my_info(current_user: dict = Depends(get_current_user)):
    """
    Validates token and returns decoded session user details
    """
    return {
        "success": True,
        "user_id": current_user.get("user_id"),
        "email": current_user.get("email")
    }
