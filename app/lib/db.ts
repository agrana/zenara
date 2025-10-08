import { createClient } from '@supabase/supabase-js';
import * as schema from '../../shared/schema';
import 'dotenv/config';

let supabaseClient;

if (process.env.NODE_ENV === 'test') {
  // In test environment, use the test client
  const { testSupabase } = require('./test-db');
  supabaseClient = testSupabase;
} else {
  // In production/development, use the real client
  // Support both Next.js (NEXT_PUBLIC_) and legacy (VITE_) env var names
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables - using mock client');
    supabaseClient = createClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export const supabase = supabaseClient;
export const db = supabaseClient;
