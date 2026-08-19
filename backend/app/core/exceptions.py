from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

class AppException(Exception):
    """Base application exception class"""
    def __init__(self, message: str, status_code: int = 500, code: str = "INTERNAL_SERVER_ERROR"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(self.message)

class AuthException(AppException):
    """Authentication or Authorization exceptions"""
    def __init__(self, message: str, status_code: int = 401, code: str = "UNAUTHORIZED"):
        super().__init__(message, status_code, code)

class DatabaseException(AppException):
    """Database read/write exception"""
    def __init__(self, message: str, status_code: int = 500, code: str = "DATABASE_ERROR"):
        super().__init__(message, status_code, code)

class ParsingException(AppException):
    """Document parsing related exception"""
    def __init__(self, message: str, status_code: int = 400, code: str = "PARSING_ERROR"):
        super().__init__(message, status_code, code)

class AIServiceException(AppException):
    """AI Generation / Gemini related exception"""
    def __init__(self, message: str, status_code: int = 502, code: str = "AI_SERVICE_ERROR"):
        super().__init__(message, status_code, code)


def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "code": exc.code,
                "message": exc.message
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "code": "HTTP_ERROR",
                "message": exc.detail
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed",
                "errors": exc.errors()
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Log the exception stack trace in real applications here
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "code": "UNKNOWN_ERROR",
                "message": f"An unexpected error occurred: {str(exc)}"
            }
        )
