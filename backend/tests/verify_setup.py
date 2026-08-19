import os
import sys
import unittest

# Ensure the root app folder is in the python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class TestBackendFoundation(unittest.TestCase):
    def test_imports(self):
        """Verifies that all core services, routers, and configurations import correctly"""
        try:
            from app.main import app
            from app.core.config import settings
            from app.core.security import verify_supabase_token
            from app.services.supabase_service import supabase_service
            from app.services.ai_service import ai_service
            from app.services.parser_service import parser_service
            from app.services.video_service import video_service
            print("[OK] All backend package modules imported successfully!")
        except Exception as e:
            self.fail(f"Failed to import modules: {str(e)}")

    def test_health_check(self):
        """Verifies that the FastAPI test client can query the health endpoint"""
        try:
            from fastapi.testclient import TestClient
            from app.main import app
            
            client = TestClient(app)
            response = client.get("/")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("status"), "healthy")
            self.assertIn("environment", data)
            print("[OK] Local API health check resolved successfully!")
        except Exception as e:
            self.fail(f"API health check failed: {str(e)}")

    def test_cors_origins(self):
        """Verifies that requests from allowed origins receive correct CORS headers"""
        try:
            from fastapi.testclient import TestClient
            from app.main import app
            from app.core.config import settings

            client = TestClient(app)
            
            # Test allowed origin: Vercel production URL
            allowed_origin = "https://primefolio-zeta.vercel.app"
            headers = {"Origin": allowed_origin}
            response = client.get("/", headers=headers)
            self.assertEqual(response.headers.get("access-control-allow-origin"), allowed_origin)
            self.assertEqual(response.headers.get("access-control-allow-credentials"), "true")

            # Test allowed origin: Localhost URL
            local_origin = "http://localhost:5173"
            headers = {"Origin": local_origin}
            response = client.get("/", headers=headers)
            self.assertEqual(response.headers.get("access-control-allow-origin"), local_origin)
            self.assertEqual(response.headers.get("access-control-allow-credentials"), "true")

            # Test dashboard stats endpoint with allowed origin preflight request
            response = client.options("/dashboard/stats", headers={
                "Origin": allowed_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization"
            })
            self.assertEqual(response.headers.get("access-control-allow-origin"), allowed_origin)
            self.assertEqual(response.headers.get("access-control-allow-credentials"), "true")
            
            print("[OK] CORS policies verified successfully!")
        except Exception as e:
            self.fail(f"CORS verification failed: {str(e)}")

if __name__ == "__main__":
    print("Starting backend foundation architecture verification...")
    # Add mockup credentials to environment variables to passSettings config checks if missing
    os.environ["SUPABASE_URL"] = os.getenv("SUPABASE_URL") or "https://mock.supabase.co"
    os.environ["SUPABASE_KEY"] = os.getenv("SUPABASE_KEY") or "mock-key"
    os.environ["SUPABASE_JWT_SECRET"] = os.getenv("SUPABASE_JWT_SECRET") or "mock-jwt-secret"
    os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY") or "mock-gemini-key"
    
    unittest.main()

