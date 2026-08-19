import { createClient } from '@supabase/supabase-js';

// Retrieve config from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Raise console alerts if keys are not loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment keys are missing. Auth functions may fail. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your frontend/.env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
