import { createClient } from '@supabase/supabase-js';

// Client uses the ANON key + the signed-in user's JWT only.
// The service-role key is NEVER referenced in client code.
const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
