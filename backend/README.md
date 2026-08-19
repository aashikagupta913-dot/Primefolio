# AI Portfolio Generator Backend

This is the production-ready FastAPI backend for the AI Portfolio Generator platform. It coordinates with Supabase (Auth, PostgreSQL DB, Storage) and Qwen AI via Groq to parse resumes, build tailored portfolio websites, generate video storyboard scripts, and manage user statistics dashboards.

## Tech Stack
- **FastAPI**: Modern, high-performance web framework for APIs in Python.
- **Supabase**: PostgreSQL database, JWT Authentication, and Storage buckets.
- **Qwen AI via Groq**: Tailored resume parsing and visual storyboard video script copywriting.
- **Pydantic / Pydantic Settings**: Schema validation and settings management.
- **PyPDF & Python-Docx**: High-performance resume text extraction libraries.

---

## API Endpoints List

### Authentication
- `POST /auth/signup`: Registers a new user via Supabase auth (syncs public profile automatically).
- `POST /auth/login`: Validates password credentials and returns a Bearer session JWT token.
- `GET /auth/me`: Decodes session user details from JWT token header validation.

### Resumes Processing
- `POST /resume/upload`: Uploads a resume file (.pdf, .docx, .txt) to Supabase private storage and saves meta records.
- `POST /resume/parse`: Extracts resume text, converts to structured JSON via Qwen AI, and returns the profile.

### Portfolios Management
- `POST /portfolio/generate`: Converts parsed resume JSON profile to website copy structure based on a selected design theme.
- `GET /portfolio/{id}`: Publicly reads published portfolios (restricts draft portfolios to creator).
- `PUT /portfolio/{id}`: Updates portfolio content or status.
- `DELETE /portfolio/{id}`: Safely deletes a portfolio created by the user.
- `GET /portfolio/themes/list`: Lists design layouts and configurations.

### AI Video Scripting
- `POST /video/generate-script`: Generates a 60-second video narration and storyboard visual prompts based on portfolio details.
- `POST /video/generate`: Schedules background video rendering tasks.
- `GET /video/job/{job_id}`: Polls processing state of background video jobs.

### User Dashboard Stats
- `GET /dashboard/stats`: Returns user statistics (total resumes, portfolios, scripts, jobs) and recent activity list.

---

## Environment Variables Configuration

Copy `.env.example` to `.env` in the root folder and configure:
```ini
PORT=8000
ENVIRONMENT=development

# Supabase Credentials
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=service-role-key-bypass-rls-for-admin
SUPABASE_JWT_SECRET=supabase-project-jwt-secret

# Groq API Key (for Qwen)
GROQ_API_KEY=gsk_your-groq-api-key
```

For setup and deployment walkthrough, refer to [SETUP.md](SETUP.md).
