# OAuth and OTP Setup Guide

This guide explains how to set up Google OAuth and OTP email verification for Teardrop Chat.

## 1. Database Migration

Run the SQL migration to add OAuth and OTP support:

```bash
# In Supabase SQL Editor, run:
backend/database/add-oauth-otp-support.sql
```

This adds:
- `google_id` - Store Google user ID
- `avatar_url` - Store profile picture URL
- `email_verified` - Track email verification status
- `otp_code` - Store OTP code for email verification
- `otp_expiry` - OTP expiration timestamp

## 2. Supabase Auth Configuration

### Enable Google OAuth Provider

1. Go to Supabase Dashboard → Authentication → Providers
2. Find "Google" and click Configure
3. Enable the Google provider
4. Get OAuth credentials from Google Cloud Console:
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Authorized JavaScript origins:
     - http://localhost:3001 (development)
     - https://teardrop-gamma.vercel.app (production)
   - Authorized redirect URIs:
     - http://localhost:3001/auth/callback
     - https://teardrop-gamma.vercel.app/auth/callback
     - https://bhnqnwsztprgssxekxvz.supabase.co/auth/v1/callback
   - Copy Client ID and Client Secret
5. Paste credentials in Supabase:
   - Client ID: [your-google-client-id]
   - Client Secret: [your-google-client-secret]
6. Save configuration

### Configure Email Settings

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize the "Magic Link" template for OTP emails
3. Set up SMTP (optional for production):
   - Go to Settings → Auth
   - Configure SMTP settings with your email service
   - For testing, Supabase's default email works fine

### Set Site URL

1. Go to Supabase Dashboard → Settings → Auth
2. Set Site URL:
   - Development: http://localhost:3001
   - Production: https://teardrop-gamma.vercel.app
3. Add Redirect URLs:
   - http://localhost:3001/auth/callback
   - https://teardrop-gamma.vercel.app/auth/callback

## 3. Backend Configuration

The backend is already configured with:

### OAuth Endpoints
- `POST /api/auth/google/callback` - Handle Google OAuth callback
- Receives: `{ email, name, google_id, avatar_url }`
- Creates user if not exists, or updates existing user
- Returns JWT token

### OTP Endpoints
- `POST /api/auth/otp/send` - Send OTP to email
- `POST /api/auth/otp/verify` - Verify OTP code

### Environment Variables
Backend `.env` needs Gmail credentials for OTP:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
```
See [GMAIL_OTP_SETUP.md](GMAIL_OTP_SETUP.md) for detailed setup.

## 4. Frontend Configuration

Already configured in:
- `frontend/src/components/LoginForm.tsx` - Google button and OTP modal
- `frontend/src/components/AuthCallback.tsx` - OAuth redirect handler
- `frontend/src/utils/api.ts` - OAuth API methods

## 5. Testing OAuth Flow

### Google Login Test:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3001
4. Click "Continue with Google" button
5. You'll be redirected to Google consent screen
6. Select your Google account
7. Grant permissions
8. You'll be redirected back to /auth/callback
9. App processes the OAuth data and logs you in
10. You should see the chat interface

### OTP Email Test:
1. Setup Gmail App Password first - See [GMAIL_OTP_SETUP.md](GMAIL_OTP_SETUP.md)
2. Click "Sign in with Email" button
3. Enter your email address
4. Click "Send OTP"
5. Check your email for 6-digit OTP code
6. Enter the code in the app
7. Click "Verify OTP"
8. You'll be logged in automatically

## 6. Production Deployment

### Railway (Backend)
No changes needed - OAuth endpoints are already deployed

### Vercel (Frontend)
1. Add redirect handling in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/auth/callback", "destination": "/index.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

2. Ensure environment variables are set:
```
VITE_API_URL=https://teardrop-production.up.railway.app/api
VITE_SUPABASE_URL=https://bhnqnwsztprgssxekxvz.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

## 7. Security Notes

### OAuth Security
- ✅ OAuth tokens handled by Supabase (secure)
- ✅ Backend validates email and creates JWT
- ✅ No password stored for OAuth users
- ✅ Rate limiting on OAuth endpoints (10 req/min)

### OTP Security
- ✅ OTP expires after 10 minutes
- ✅ 6-digit random code
- ✅ Rate limiting (5 OTP requests per minute)
- ✅ OTP cleared after successful verification
- ✅ Email sent via Gmail SMTP (Nodemailer)
- ✅ Beautiful HTML email template
- 📧 **Setup Gmail App Password** - See [GMAIL_OTP_SETUP.md](GMAIL_OTP_SETUP.md)

### Recommendations
1. Enable 2FA for Supabase dashboard access
2. Rotate OAuth secrets regularly
3. Monitor auth logs in Supabase dashboard
4. Set up email service for production OTP
5. Add reCAPTCHA to prevent bot abuse (optional)

## 8. Troubleshooting

### "Google login failed"
- Check Google Cloud Console credentials
- Verify redirect URIs match exactly
- Check browser console for errors
- Ensure Supabase project is not paused

### "OTP not received"
- Check spam folder
- Verify email in Supabase → Authentication → Users
- Check Supabase → Logs for email send errors
- For production, configure SMTP

### "OAuth callback error"
- Check browser console and network tab
- Verify backend is running and accessible
- Check CORS settings in backend/server.js
- Ensure Supabase anon key is correct

### "Invalid token"
- Clear localStorage and try again
- Check backend logs for JWT errors
- Verify user exists in database

## 9. Demo Account

For testing without OAuth setup, use:
- Email: test@example.com / Password: test123
- Email: demo@example.com / Password: demo123

## 10. API Documentation

### POST /api/auth/google/callback
Request:
```json
{
  "email": "user@gmail.com",
  "name": "John Doe",
  "google_id": "1234567890",
  "avatar_url": "https://lh3.googleusercontent.com/..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "user@gmail.com", ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Google login successful"
}
```

### POST /api/auth/otp/send
Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "data": { "email": "user@example.com" },
  "message": "OTP sent to your email"
}
```

### POST /api/auth/otp/verify
Request:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "user@example.com", ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "OTP verified successfully"
}
```
