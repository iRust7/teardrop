# 🔍 Debugging 403 Forbidden Error

## Problem
Getting `403 Forbidden` error on login at `https://teardrop-production.up.railway.app/api/auth/login`

## Common Causes

### 1. ❌ Email Not Verified
**Most Common Cause** - User registered but didn't complete email verification.

**Check:**
- Look for error message: "Please verify your email first"
- Backend log: `[LOGIN] Email not verified for: email@example.com`

**Fix:**
- User must check email for OTP code
- Complete registration by entering OTP
- Or resend OTP from registration page

### 2. ❌ CORS Blocked
Frontend origin not allowed by backend.

**Check Backend Logs:**
```
[CORS] ⛔ Blocked origin: https://your-frontend.vercel.app
[CORS] Allowed origins: [...]
```

**Fix in `backend/server.js`:**
```javascript
const allowedOrigins = [
  'https://teardrop-gamma.vercel.app',
  'https://your-frontend-url.vercel.app',  // Add your domain
  config.frontendUrl
]
```

### 3. ❌ Rate Limiting
Too many failed login attempts.

**Check Backend Logs:**
```
[RATE LIMIT] ⛔ Blocked 123.456.789.0 - 100/100 requests
```

**Temporary Fix:**
Increased limit to 100 req/min in this commit.

### 4. ❌ Missing Required Fields
Request body validation failed.

**Check:**
- Email and password must be provided
- Backend log: `Missing required fields: email, password`

## New Logging Added

### Backend Logs to Watch:
```bash
# Login attempt
[LOGIN] Attempt for email: user@example.com

# User found
[LOGIN] User found: user@example.com, email_verified: false

# Email not verified (403)
[LOGIN] Email not verified for: user@example.com

# CORS check
[CORS] Allowed origin: https://teardrop-gamma.vercel.app

# Rate limiting
[RATE LIMIT] 123.456.789.0 - 5/100 requests
```

### Frontend Console Logs:
```javascript
[LOGIN] Attempting login for: user@example.com
[LOGIN] Login error: Request failed with status code 403
```

## Testing Steps

### 1. Check Railway Logs
```bash
# Go to Railway dashboard
# Select your project
# Click "Deployments" → View Logs
# Look for [LOGIN] and [CORS] messages
```

### 2. Test with Complete Registration
```bash
1. Register new user
2. Check email for OTP
3. Enter OTP code
4. Complete registration
5. Try login again
```

### 3. Verify CORS Headers
```bash
# In browser console
fetch('https://teardrop-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
}).then(r => console.log(r.status))
```

### 4. Check Network Tab
```
1. Open DevTools → Network
2. Find the failed request
3. Check Response Headers:
   - Access-Control-Allow-Origin
   - Access-Control-Allow-Methods
4. Check Response Body for error details
```

## Quick Fixes

### Fix 1: Clear Rate Limit (Backend)
```javascript
// In backend/src/middleware/auth.js
const rateLimitMap = new Map();
// Clear manually or restart server
```

### Fix 2: Allow All Origins (Temporary - for debugging only!)
```javascript
// In backend/server.js
app.use(cors({
  origin: '*', // WARNING: Only for debugging!
  credentials: true
}));
```

### Fix 3: Bypass Email Verification (Testing only!)
```javascript
// In backend/src/controllers/authController.js
// Comment out email verification check temporarily
// if (!user.email_verified) {
//   return res.status(403).json(...)
// }
```

## Production Deployment

After fixing, deploy:

### Backend (Railway)
```bash
git add .
git commit -m "fix: add detailed logging for 403 errors"
git push origin main
# Railway auto-deploys
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
git add .
git commit -m "fix: handle email verification error"
git push origin main
# Vercel auto-deploys
```

## Environment Variables to Check

### Backend (.env)
```env
FRONTEND_URL=https://teardrop-gamma.vercel.app
NODE_ENV=production
TURNSTILE_SECRET_KEY=your-secret-key
```

### Frontend (Vercel)
```env
VITE_API_URL=https://teardrop-production.up.railway.app/api
VITE_TURNSTILE_SITE_KEY=your-site-key
```

## Support

If still getting 403:
1. Check Railway logs for exact error
2. Verify user email_verified status in database
3. Try with newly registered account
4. Check CORS preflight request (OPTIONS)
5. Verify rate limit not exceeded

Current rate limits:
- Login: 100 requests/min
- Register: 10 requests/min
- Resend OTP: 10 requests/min
