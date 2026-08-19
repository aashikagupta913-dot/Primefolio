ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS selected_generation_mode TEXT,
ADD COLUMN IF NOT EXISTS selected_theme TEXT,
ADD COLUMN IF NOT EXISTS ai_generated_config JSONB;
