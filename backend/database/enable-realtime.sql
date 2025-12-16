-- Enable Realtime for messages and users tables
-- Run this in Supabase SQL Editor

-- 1. Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Enable Realtime for users table  
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- 3. Verify Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
