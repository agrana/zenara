import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
export const testSupabase = createClient(
  'https://test.supabase.co',
  'test-anon-key'
);
