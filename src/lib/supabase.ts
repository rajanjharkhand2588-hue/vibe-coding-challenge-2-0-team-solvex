import { createClient } from '@supabase/supabase-js';

// Production fallbacks to guarantee zero blank-screens on Vercel or any environment
const DEFAULT_SUPABASE_URL = 'https://sxozzpmbmtwwvewrccfv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b3p6cG1ibXR3d3Zld3JjY2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjQyMDksImV4cCI6MjEwOTU0MDIwOX0._qLcU10j_Oqj_9RYiJI_eKtm9ryB1pXERq61Tprb9kc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
