import { createClient } from '@supabase/supabase-js';

// Supabase config - using environment variables
const supabaseUrl = 'https://bhnqnwsztprgssxekxvz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobnFud3N6dHByZ3NzeGVreHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTcwNzUsImV4cCI6MjA4MTM3MzA3NX0.BSGVO2Yv3GerxVjR8vd71w15Al5hflhv1ZwXgSVV2SU';

// Create Supabase client for real-time subscriptions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
