from fastapi import Depends
from app.core.security import get_token_from_header, verify_supabase_token
from app.core.exceptions import AuthException

def get_current_user(token: str = Depends(get_token_from_header)) -> dict:
    """
    Dependency that extracts the current user from the Supabase JWT.
    Throws HTTP 401 if authentication fails.
    """
    try:
        user_info = verify_supabase_token(token)
        return user_info
    except AuthException as ae:
        raise ae
    except Exception as e:
        raise AuthException(f"Failed to authenticate: {str(e)}", status_code=401)
