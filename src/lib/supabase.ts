
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://xkyfvgchxyqmdwctuimz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreWZ2Z2NoeHlxbWR3Y3R1aW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTU0NzMsImV4cCI6MjA2NTgzMTQ3M30.g7Ssf5FNbCJi6rh3Hv044WhP8hVIhS2fPzJnRZM5GJk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
