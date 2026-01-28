// Server-side Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mfsjbqwnxodmtyhizwpn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mc2picXdueG9kbXR5aGl6d3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njk0ODksImV4cCI6MjA3MzM0NTQ4OX0.-NduhSST-AuDR0YeKtBLG_6YoHyP3Jr9GuKTfi3EZXs";

// Server-side client - no localStorage, no session persistence
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});