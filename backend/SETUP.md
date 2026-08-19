# Backend Setup & Database Migrations Guide

Follow these steps to set up and run the FastAPI backend server locally.

## Prerequisite Checks

Ensure you have Python 3.9+ installed:
```bash
python --version
```

---

## 1. Virtual Environment Setup

Create and activate a python virtual environment inside the `backend` directory:

### Windows (PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### macOS/Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

Install application dependencies:
```bash
pip install -r requirements.txt
```

---

## 2. Supabase Database Migration Setup

We have prepared the SQL migration code in [20260813000000_init_schema.sql](supabase/migrations/20260813000000_init_schema.sql).

To run the migration:
1. Log in to your **Supabase Dashboard**.
2. Select your project and navigate to the **SQL Editor**.
3. Click **New Query**, copy the contents of the migration SQL file, and click **Run**.
4. The migration script will automatically create:
   - Tables: `users`, `themes`, `resumes`, `portfolios`, `generated_scripts`, `video_jobs`
   - Trigger functions: to sync newly signed-up Auth users to the public `users` table automatically.
   - Storage Buckets: `resumes` and `generated-assets` with Row Level Security (RLS) policies configured.
   - Pre-seeded layouts data.

---

## 3. Starting the Server

Launch the development server:
```bash
uvicorn app.main:app --port 8000 --reload
```

The APIs will be available on **`http://localhost:8000/`**.
You can view interactive Swagger documentation at **`http://localhost:8000/docs`**.
