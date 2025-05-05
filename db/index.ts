
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_KEY must be set in your environment variables",
  );
}

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
