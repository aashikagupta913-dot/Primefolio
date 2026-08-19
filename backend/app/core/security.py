from fastapi import Request
from jose import jwt, JWTError
from app.core.config import settings
from app.core.exceptions import AuthException

def verify_supabase_token(token: str) -> dict:
    """
    Decodes and validates a Supabase JWT token.
    Extracts user details (user_id and email). Uses local HS256 decode if secret is valid,
    and falls back to validating directly against the Supabase Auth service.
    """
    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "mock-jwt-secret":
        try:
            # Decodes with HS256 using the project's JWT secret
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}  # Allows both 'anon' and 'authenticated' token scopes
            )
            
            user_id = payload.get("sub")
            email = payload.get("email")
            
            if not user_id:
                raise AuthException("Token is missing user identifier (sub)", status_code=401)
                
            return {
                "user_id": user_id,
                "email": email,
                "role": payload.get("role"),
                "raw_payload": payload
            }
        except JWTError:
            pass # Fall through to remote authentication verification

    # Auth Service Call Fallback
    try:
        from app.services.supabase_service import supabase_service
        res = supabase_service.client.auth.get_user(token)
        if res and res.user:
            return {
                "user_id": str(res.user.id),
                "email": res.user.email,
                "role": getattr(res.user, "role", "authenticated"),
                "raw_payload": {}
            }
        raise AuthException("Failed to decode token locally or query Supabase auth user context.", status_code=401)
    except Exception as e:
        raise AuthException(f"Could not validate credentials: {str(e)}", status_code=401)

def get_token_from_header(request: Request) -> str:
    """
    Extracts Bearer token from authorization header
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise AuthException("Missing Authorization header", status_code=401)
        
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthException("Authorization header must be Bearer token", status_code=401)
        
    return parts[1]
