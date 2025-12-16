# 🔐 New Authentication Flow - Summary

## ✅ Perubahan Yang Sudah Dibuat

### Backend Changes:

1. **Register Flow (Dengan OTP)**
   - User register → OTP dikirim via Gmail
   - User harus verify OTP untuk activate account
   - Turnstile captcha required untuk register
   - Email verified = false sampai OTP di-verify

2. **Login Flow (Dengan Rate Limiting)**
   - Check email verified status
   - Track failed login attempts
   - Setelah 3x failed → require Turnstile captcha
   - Reset counter setelah login berhasil

3. **New Endpoints:**
   - `POST /auth/register` - Register + send OTP (requires turnstileToken)
   - `POST /auth/verify-otp` - Verify OTP after registration
   - `POST /auth/resend-otp` - Resend OTP code
   - `POST /auth/login` - Login (requires turnstileToken after 3 failed attempts)

4. **Database Migration:**
   - Added: `failed_login_attempts` column
   - Already has: `otp_code`, `otp_expiry`, `email_verified`

### Frontend Changes Needed:

1. **RegisterForm.tsx** - Need to add:
   - Turnstile captcha widget
   - OTP verification modal after register
   - Resend OTP button

2. **LoginForm.tsx** - Need to update:
   - Remove OTP login button (tidak perlu)
   - Add Turnstile captcha (conditional setelah 3x failed)
   - Handle requireCaptcha error response

3. **.env** - Add:
   ```
   VITE_TURNSTILE_SITE_KEY=your-site-key
   ```

## 🎯 New User Flow:

### Registration:
```
1. User fill form (username, email, password)
2. Complete Turnstile captcha
3. Click "Register"
4. Backend creates user (email_verified = false)
5. OTP sent via Gmail
6. Modal appears → User input 6-digit OTP
7. Click "Verify"
8. Email verified → Auto login
```

### Login:
```
1. User input email & password
2. Click "Login"
3. If failed < 3x → Show error with remaining attempts
4. If failed >= 3x → Require Turnstile captcha
5. After captcha → Try login again
6. Success → Reset failed attempts counter
```

## 🔧 Next Steps:

### 1. Setup Cloudflare Turnstile:
- Go to: https://dash.cloudflare.com/
- Create Turnstile widget
- Get Site Key & Secret Key
- Add to .env files

### 2. Run Database Migration:
```sql
-- In Supabase SQL Editor
backend/database/add-oauth-otp-support.sql
```

### 3. Update Frontend Components:
- RegisterForm.tsx - Add Turnstile + OTP modal
- LoginForm.tsx - Remove OTP button, add conditional Turnstile

### 4. Update Environment Variables:
**Backend (.env):**
```env
TURNSTILE_SECRET_KEY=your-secret-key
```

**Frontend (.env):**
```env
VITE_TURNSTILE_SITE_KEY=your-site-key
```

## 📧 Email Flow:

**Registration OTP Email:**
```
Subject: 🔐 Verify Your Teardrop Chat Account
Body: Your 6-digit OTP code
Valid for: 10 minutes
```

## 🔒 Security Features:

- ✅ Turnstile captcha pada register (prevent bot)
- ✅ Rate limiting login (3 attempts before captcha)
- ✅ OTP email verification (confirm real email)
- ✅ Failed attempts tracking per user
- ✅ OTP expires after 10 minutes
- ✅ Auto reset failed attempts on success

## 🚀 Testing:

### Test Register:
1. Fill registration form
2. Complete captcha
3. Submit → Check email for OTP
4. Enter OTP → Verify
5. Should auto login

### Test Login Rate Limiting:
1. Try login with wrong password
2. See message: "2 attempts remaining"
3. Try 2 more times with wrong password
4. 4th attempt → Turnstile captcha appears
5. Complete captcha → Try login
6. Success → Counter reset

## 💡 Benefits:

**Untuk Security:**
- Mencegah bot registration
- Mencegah brute force login
- Verify email ownership
- Track suspicious activity

**Untuk User:**
- Email verification otomatis
- Clear error messages
- Smooth onboarding flow
- Protection dari spam accounts

## ⚠️ Important Notes:

1. **OTP is for REGISTRATION only** (not for login)
2. **Turnstile required untuk:**
   - Semua registration
   - Login setelah 3x failed attempts
3. **Failed attempts counter:**
   - Per user (not per IP)
   - Reset on successful login
   - Persisted in database

## 📝 Code Changes Summary:

**Modified:**
- `backend/src/controllers/authController.js` - Register & Login logic
- `backend/src/routes/auth.js` - New OTP routes
- `backend/database/add-oauth-otp-support.sql` - failed_login_attempts column
- `backend/.env` - TURNSTILE_SECRET_KEY
- `frontend/src/utils/api.ts` - Update API methods
- `frontend/.env` - VITE_TURNSTILE_SITE_KEY

**Need to Update:**
- `frontend/src/components/RegisterForm.tsx` - Add Turnstile + OTP
- `frontend/src/components/LoginForm.tsx` - Remove OTP, add Turnstile

---

**Next:** Mari saya buatkan complete updated files untuk RegisterForm dan LoginForm!
