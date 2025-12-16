# Supabase Auth Setup untuk OTP Email

## ✅ Sudah Dikonfigurasi

Aplikasi Teardrop Chat sekarang menggunakan **Supabase Auth** untuk mengirim OTP, menggantikan Gmail SMTP.

### Keuntungan Supabase Auth:
- ✅ **No timeout issues** - reliable email delivery
- ✅ **Built-in rate limiting** - automatic spam protection
- ✅ **Free tier** - 30,000 emails/month gratis
- ✅ **No configuration needed** - works out of the box
- ✅ **Professional templates** - email templates sudah bagus
- ✅ **Better deliverability** - jarang masuk spam

## 🎯 Cara Kerja

### 1. User Register
```typescript
// Frontend mengirim OTP via Supabase
await supabase.auth.signInWithOtp({
  email: 'user@email.com',
  options: {
    shouldCreateUser: false
  }
});
```

### 2. User Verifikasi OTP
```typescript
// Frontend verifikasi OTP
await supabase.auth.verifyOtp({
  email: 'user@email.com',
  token: '123456',
  type: 'email'
});
```

### 3. Backend Update Database
Backend kemudian update database untuk mark email as verified dan generate JWT token custom kita.

## 📧 Email Template Default

Supabase akan mengirim email dengan format:
```
Subject: Confirm Your Email

Your confirmation code is: 123456

This code expires in 1 hour.
```

## ⚙️ Konfigurasi Supabase Dashboard (WAJIB)

### Step 1: Enable Email OTP

**Ini WAJIB dilakukan agar OTP bisa dikirim:**

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: `bhnqnwsztprgssxekxvz` (teardrop-chat)
3. Go to **Authentication** → **Providers**
4. Scroll ke **Email** provider
5. Enable toggle **"Enable Email provider"**
6. Enable toggle **"Enable Email OTP"** atau **"Confirm email"**
7. **Save** changes

### Step 2: Configure Email Settings (Opsional)

1. Go to **Authentication** → **Email Templates**
2. Edit template "Confirm signup" atau "Magic Link"
3. Customize subject, body, dan expiry time
4. Set OTP expiry (default 1 hour, bisa ganti jadi 5 menit)

### Contoh Custom Template
```html
<h2>Welcome to Teardrop Chat! 💬</h2>
<p>Your verification code is:</p>
<h1>{{ .Token }}</h1>
<p>This code expires in 60 minutes.</p>
```

## 🔍 Testing

### Test Local:
```bash
cd backend
npm run dev
```

Kemudian register user baru di frontend (localhost:5173)

### Test Production:
Register user di: https://teardrop-gamma.vercel.app

## 🚨 Troubleshooting

### Email tidak diterima?
1. Cek spam/junk folder
2. Pastikan email valid
3. Cek Supabase Dashboard → Logs untuk error
4. Rate limit: max 4 OTP per hour per email

### OTP Invalid?
- OTP expired (default 1 hour)
- OTP sudah dipakai
- Request OTP baru

## 📊 Monitoring

Check Supabase Dashboard → Authentication → Logs untuk:
- Email sent status
- OTP verification attempts
- Rate limiting events

## 🔐 Security

- OTP expires after 1 hour (default Supabase)
- Rate limited to prevent spam
- Supabase handles all security automatically
- No credentials to manage or rotate

## 📚 Reference

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email OTP Guide](https://supabase.com/docs/guides/auth/auth-email)
