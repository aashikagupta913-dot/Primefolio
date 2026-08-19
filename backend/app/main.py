from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.api.endpoints import auth, resumes, portfolios, scripts, video, dashboard

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="Foundation backend for AI Portfolio Generator"
    )

    # 1. Setup CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Setup exception handlers
    setup_exception_handlers(app)

    # 3. Include Routers
    app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
    app.include_router(resumes.router, prefix="/resume", tags=["Resume Processing"])
    app.include_router(portfolios.router, prefix="/portfolio", tags=["Portfolio Generator"])
    app.include_router(scripts.router, prefix="/video", tags=["AI Script Generator"])
    app.include_router(video.router, prefix="/video", tags=["AI Video Generator"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["User Dashboard"])

    @app.get("/", tags=["Health Check"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "status": "healthy",
            "environment": settings.ENVIRONMENT
        }

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
