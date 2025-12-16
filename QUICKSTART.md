# Quick Start: Testing OAuth & OTP

## 🚀 Fastest Way to Test

### 1. Run Database Migration (Required)
```sql
-- In Supabase SQL Editor (https://supabase.com/dashboard)
-- Copy and paste content from:
backend/database/add-oauth-otp-support.sql
```

### 2. Start Backend
```powershell
cd backend
npm run dev
```

### 3. Start Frontend
```powershell
cd frontend
npm run dev
```

### 4. Open Browser
```
http://localhost:3001
```

## 🧪 Test Without OAuth Setup

You can test the basic app immediately without configuring OAuth:

1. Use test accounts:
   - Email: `test@example.com` / Password: `test123`
   - Email: `demo@example.com` / Password: `demo123`

2. The OAuth buttons will be visible but won't work until you configure Google OAuth (see OAUTH_SETUP.md)

## ⚡ Quick OAuth Setup (5 minutes)

### Step 1: Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Create project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   ```
   http://localhost:3001/auth/callback
   https://bhnqnwsztprgssxekxvz.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

### Step 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** → Click **Configure**
5. Enable Google provider
6. Paste Client ID and Client Secret
7. Save

### Step 3: Configure Site URL
1. In Supabase → **Settings** → **Auth**
2. Set **Site URL**: `http://localhost:3001`
3. Add **Redirect URLs**:
   ```
   http://localhost:3001/auth/callback
   ```
4. Save

### Step 4: Test Google Login
1. Refresh your browser at `http://localhost:3001`
2. Click **"Continue with Google"** button
3. Sign in with your Gmail account
4. You should be redirected and logged in! 🎉

## 📧 OTP Email Test (Gmail)

OTP menggunakan Gmail SMTP - **perlu setup Gmail App Password!**

### Setup Gmail (5 menit):
1. Buat Gmail baru: `teardropchat.otp@gmail.com`
2. Aktifkan 2-Step Verification di Google Account
3. Generate App Password (16 digit)
4. Update `backend/.env`:
   ```env
   GMAIL_USER=teardropchat.otp@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
5. Restart backend

**Panduan lengkap:** [GMAIL_OTP_SETUP.md](GMAIL_OTP_SETUP.md)

### Test OTP:
1. Click **"Sign in with Email"** button
2. Masukkan email user yang sudah terdaftar
3. Click **"Send OTP"**
4. Cek email → Kamu akan dapat kode 6 digit
5. Masukkan kode OTP di aplikasi
6. Click **"Verify OTP"**
7. Login berhasil! 🎉

## ❗ Troubleshooting

### "Google login failed"
- Check if you enabled Google provider in Supabase
- Verify redirect URIs match exactly
- Check browser console for errors

### "OTP not received"
- Check spam folder
- Wait 1-2 minutes
- Try different email provider
- Check Supabase logs: **Authentication** → **Logs**

### "Cannot read properties of undefined"
- Clear browser cache and localStorage
- Restart frontend server
- Check backend is running on port 3002

### Backend not starting
```powershell
# Make sure you have .env file in backend folder
cd backend
cat .env  # Should show SUPABASE_URL, JWT_SECRET, etc.
npm install
npm run dev
```

## 📁 File Structure

```
backend/
  ├── .env                    # Backend config
  ├── server.js               # Express server
  ├── src/
  │   ├── controllers/
  │   │   └── authController.js   # OAuth & OTP handlers ✨
  │   └── routes/
  │       └── auth.js             # OAuth routes ✨
  └── database/
      └── add-oauth-otp-support.sql   # Migration ✨

frontend/
  ├── .env                    # Frontend config
  ├── src/
  │   ├── components/
  │   │   ├── AuthCallback.tsx     # OAuth redirect ✨
  │   │   └── LoginForm.tsx        # OAuth buttons ✨
  │   ├── utils/
  │   │   └── api.ts               # OAuth API calls ✨
  │   └── App.tsx                  # Route handling ✨
  └── vercel.json             # Deployment config ✨

✨ = New or modified for OAuth/OTP
```

## 🎯 What Works Right Now

Without OAuth setup:
- ✅ Email/password login
- ✅ User registration
- ✅ Real-time messaging
- ✅ File upload
- ✅ Emoji picker
- ❌ Google OAuth (needs setup)
- ✅ OTP Email (works via Supabase)

With OAuth setup:
- ✅ Everything above
- ✅ Google OAuth login
- ✅ Profile pictures from Google
- ✅ Email pre-verified

## 🔥 Production Deployment

### Railway (Backend)
Already deployed! OAuth endpoints are live:
```
https://teardrop-production.up.railway.app/api/auth/google/callback
https://teardrop-production.up.railway.app/api/auth/otp/send
https://teardrop-production.up.railway.app/api/auth/otp/verify
```

### Vercel (Frontend)
1. Push code to GitHub
2. Vercel will auto-deploy
3. Add production redirect URI to Google OAuth:
   ```
   https://teardrop-gamma.vercel.app/auth/callback
   ```
4. Update Supabase Site URL:
   ```
   https://teardrop-gamma.vercel.app
   ```

## 📖 Full Documentation

- **OAUTH_SETUP.md** - Detailed setup guide
- **OAUTH_IMPLEMENTATION.md** - Technical details
- **README.md** - Project overview

## 🎉 That's It!

You now have:
- Google OAuth login
- OTP email verification
- File sharing
- Emoji support
- Real-time chat

Enjoy Teardrop Chat! 💬
