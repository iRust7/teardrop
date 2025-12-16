# 🚀 Production Deployment Fixes

## Issues Fixed

### 1. ❌ 403 Forbidden on Login
**Problem:** Rate limiting too strict (10 requests/min)
**Fix:** Increased to 20 requests/min

### 2. ❌ 404 on /api/auth/resend-otp
**Problem:** Backend not deployed with new endpoint
**Fix:** Ensure latest backend code is deployed to Railway

### 3. ❌ 429 Too Many Requests
**Problem:** Resend OTP limited to 3 requests/min
**Fix:** Increased to 10 requests/min for better UX

### 4. ❌ Turnstile Error 600010
**Problem:** Widget loading failures
**Fix:** 
- Added error callback handling
- Added retry mechanism with interval check
- Added fallback mode if widget fails
- Better error messages to users

## Changes Made

### Backend (`backend/src/routes/auth.js`)
```javascript
// Login rate limit: 10 → 20 requests/min
router.post('/login', rateLimit(20, 60000), ...)

// Verify OTP rate limit: 10 → 15 requests/min
router.post('/verify-otp', rateLimit(15, 60000), ...)

// Resend OTP rate limit: 3 → 10 requests/min
router.post('/resend-otp', rateLimit(10, 60000), ...)
```

### Backend (`backend/server.js`)
- Added support for multiple production frontend URLs
- Better CORS origin handling with array flattening

### Frontend (`frontend/src/components/RegisterForm.tsx`)
- Added Turnstile error callback
- Added retry mechanism for widget loading
- Added fallback mode if Turnstile unavailable
- Better error logging for debugging

## Deployment Checklist

### Backend (Railway)
1. ✅ Ensure latest code is pushed to repository
2. ✅ Trigger manual deploy on Railway if needed
3. ✅ Verify environment variables:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `TURNSTILE_SECRET_KEY`
   - `FRONTEND_URL`
4. ✅ Check deployment logs for errors

### Frontend (Vercel)
1. ✅ Build locally: `npm run build`
2. ✅ Commit and push changes
3. ✅ Verify environment variables on Vercel:
   - `VITE_API_URL`
   - `VITE_TURNSTILE_SITE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. ✅ Wait for automatic deployment
5. ✅ Test all features

## Testing After Deployment

### Test Sequence:
1. **Registration Flow:**
   - Fill registration form
   - Click "Send OTP" (should work even if email not registered)
   - Check email for OTP
   - Enter OTP code
   - Complete Turnstile captcha
   - Submit registration
   - Should auto-login

2. **Login Flow:**
   - Use verified credentials
   - Should login without captcha
   - Try 3 wrong passwords
   - Should show Turnstile captcha

3. **OTP Resend:**
   - Try resending OTP multiple times
   - Should work up to 10 times per minute

## Monitoring

Watch for these in production logs:
- `[PRE-REGISTER OTP] Code sent` - OTP for unregistered emails
- `[RESEND OTP] Code sent` - OTP for registered users
- `[CORS] Blocked origin` - CORS issues
- `[Turnstile] Widget error` - Captcha loading issues

## Rate Limits (Current)

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/register` | 10 req | 1 min |
| `/auth/login` | 20 req | 1 min |
| `/auth/verify-otp` | 15 req | 1 min |
| `/auth/resend-otp` | 10 req | 1 min |

## Common Issues

### Issue: "User not found" when sending OTP
**Solution:** ✅ Fixed - Backend now handles unregistered emails

### Issue: Turnstile not loading
**Solution:** ✅ Fixed - Added fallback mode and better error handling

### Issue: 429 errors on resend
**Solution:** ✅ Fixed - Increased limit from 3 to 10 per minute

### Issue: 403 on login
**Solution:** ✅ Fixed - Increased limit from 10 to 20 per minute
