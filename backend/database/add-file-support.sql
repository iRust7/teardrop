-- Add file support to messages table
-- Run this in Supabase SQL Editor

-- 1. Add type column (text or file)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'text' CHECK (type IN ('text', 'file'));

-- 2. Add file_data column to store file metadata
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS file_data JSONB;

-- 3. Make content nullable for file messages
ALTER TABLE messages
ALTER COLUMN content DROP NOT NULL;

-- 4. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);

-- 5. Create storage bucket for chat files (if not exists)
-- Note: This might need to be done via Supabase Dashboard -> Storage
-- Bucket name: chat-files
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/*, video/*, application/pdf, etc.

-- 6. Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('type', 'file_data', 'content');
