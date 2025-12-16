-- Add OAuth and OTP support to users table
-- Run this in Supabase SQL editor

-- Add OAuth fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add OTP fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update existing users to have email_verified = true
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;

-- Make password_hash nullable (for OAuth-only users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
