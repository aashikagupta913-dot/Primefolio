-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES DEFINITIONS
-- ==========================================

-- USERS TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- THEMES TABLE (Predefined templates)
CREATE TABLE IF NOT EXISTS public.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    config JSONB NOT NULL, -- e.g., { primaryColor, secondaryColor, font, layoutStyle }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage URL or filepath
    raw_text TEXT,           -- Extracted plaintext
    parsed_data JSONB,       -- Structured JSON profile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
    subdomain TEXT UNIQUE,
    title TEXT NOT NULL,
    tagline TEXT,
    about TEXT,
    profile_image_url TEXT,
    contact_email TEXT,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb NOT NULL,
    experience JSONB DEFAULT '[]'::jsonb NOT NULL,
    projects JSONB DEFAULT '[]'::jsonb NOT NULL,
    education JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- GENERATED SCRIPTS TABLE (AI intro videos)
CREATE TABLE IF NOT EXISTS public.generated_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    script_text TEXT NOT NULL,
    scenes JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of { scene_number, visual_prompt, voiceover }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VIDEO JOBS TABLE
CREATE TABLE IF NOT EXISTS public.video_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    script_id UUID REFERENCES public.generated_scripts(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL, -- pending, processing, completed, failed
    error_message TEXT,
    video_url TEXT,
    avatar_id TEXT,
    voice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- 2. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_subdomain ON public.portfolios(subdomain);
CREATE INDEX IF NOT EXISTS idx_generated_scripts_user_id ON public.generated_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON public.video_jobs(user_id);


-- ==========================================
-- 3. TRIGGERS & FUNCTIONS
-- ==========================================

-- Automatically update timestamps helper
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach timestamp triggers
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_resumes_timestamp BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_portfolios_timestamp BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_generated_scripts_timestamp BEFORE UPDATE ON public.generated_scripts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_video_jobs_timestamp BEFORE UPDATE ON public.video_jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatically sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read-only of users" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public read of themes" ON public.themes;
DROP POLICY IF EXISTS "Allow users to manage own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow users to manage own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Allow public read of published portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Allow users to manage own scripts" ON public.generated_scripts;
DROP POLICY IF EXISTS "Allow users to manage own video jobs" ON public.video_jobs;

-- users policies
CREATE POLICY "Allow public read-only of users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- themes policies
CREATE POLICY "Allow public read of themes" ON public.themes
    FOR SELECT USING (true);

-- resumes policies
CREATE POLICY "Allow users to manage own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- portfolios policies
CREATE POLICY "Allow users to manage own portfolios" ON public.portfolios
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read of published portfolios" ON public.portfolios
    FOR SELECT USING (is_published = true OR auth.uid() = user_id);

-- generated_scripts policies
CREATE POLICY "Allow users to manage own scripts" ON public.generated_scripts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- video_jobs policies
CREATE POLICY "Allow users to manage own video jobs" ON public.video_jobs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- 5. STORAGE BUCKETS & POLICIES SETUP
-- ==========================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('resumes', 'resumes', false),
    ('generated-assets', 'generated-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Resumes Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Resumes Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Resumes Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Resumes Delete Policy" ON storage.objects;
DROP POLICY IF EXISTS "Generated Assets Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Generated Assets Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Generated Assets Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Generated Assets Delete Policy" ON storage.objects;

-- Resumes Storage Policies (authenticated users manage their own files in their own folder)
CREATE POLICY "Resumes Select Policy" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Resumes Insert Policy" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Resumes Update Policy" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Resumes Delete Policy" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Generated Assets Storage Policies (public read, authenticated folder write)
CREATE POLICY "Generated Assets Select Policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'generated-assets');

CREATE POLICY "Generated Assets Insert Policy" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'generated-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Generated Assets Update Policy" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'generated-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Generated Assets Delete Policy" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'generated-assets' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ==========================================
-- 6. SEED DATA
-- ==========================================
INSERT INTO public.themes (name, slug, config)
VALUES 
    ('Minimalist Sleek', 'minimalist', '{"primary": "#1f2937", "secondary": "#6b7280", "font": "Inter", "background": "#f9fafb", "layout": "standard"}'),
    ('Midnight Cyber', 'modern-dark', '{"primary": "#818cf8", "secondary": "#a78bfa", "font": "Outfit", "background": "#0f172a", "layout": "glassmorphism"}'),
    ('Neo-Brutalist Pop', 'neobrutalist', '{"primary": "#000000", "secondary": "#ffde47", "font": "Space Grotesk", "background": "#ff6b6b", "layout": "sharp-borders"}'),
    ('Creative Horizon', 'creative-gradient', '{"primary": "#ec4899", "secondary": "#8b5cf6", "font": "Plus Jakarta Sans", "background": "#0a0a0a", "layout": "gradient-glow"}'),
    ('Portfolio 2023 (Community)', 'portfolio-2023', '{"primary": "#14b8a6", "secondary": "#6366f1", "font": "Outfit", "background": "#0b0f19", "layout": "grid-showcase"}')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    config = EXCLUDED.config;
