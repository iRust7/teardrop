-- Mark all existing users as verified (users registered before OTP implementation)
-- This allows old users to login without email verification
-- Only new users (registered after this update) will require OTP verification

UPDATE users 
SET email_verified = true 
WHERE email_verified = false;

-- Optional: Check results
SELECT id, email, email_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
