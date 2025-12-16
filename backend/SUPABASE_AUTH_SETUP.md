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
Subject: Teardrop Chat Verification

Use the verification code below to sign in.

[Your verification code: 123456]

This code expires in 60 seconds.
```

## ⚙️ Konfigurasi Supabase Dashboard (WAJIB)

### Step 1: Aktifkan Email OTP ⚠️

**Fix error "Signups not allowed for otp" dalam 1 menit:**

1. **Buka:** https://supabase.com/dashboard/project/bhnqnwsztprgssxekxvz
2. **Masuk ke:** Authentication → Sign In / Providers
3. **Klik Email** (untuk expand settings)
4. **Pastikan kondisi ini:**
   - ✅ **Enable Email provider** = ON (toggle hijau)
   - ✅ **Email OTP Expiration** MUNCUL di form (misal: 60 atau 3600 seconds)
   - ✅ **Confirm email** = ON (opsional tapi disarankan)
5. **Klik SAVE** (penting!)

### 💡 Catatan Penting:

**Di UI Supabase terbaru:**
- ❌ TIDAK ADA toggle terpisah "Enable Email OTP"
- ✅ OTP aktif secara otomatis jika **Email provider ON** + **field "Email OTP Expiration" muncul**
- Kalau field **Email OTP Expiration** terlihat di form, berarti OTP sudah AKTIF

**Kalau masih error "otp_disabled":**
1. Email provider belum ON, atau
2. Perubahan belum di-SAVE (klik tombol Save!)

### Step 2: Configure Email Settings (Opsional)

1. Go to **Authentication** → **Email Templates**
2. Edit template "Confirm signup" atau "Magic Link"
3. Customize subject, body, dan expiry time
4. Set OTP expiry (default 1 hour, bisa ganti jadi 5 menit)

### Custom Template (Already Applied)

Template email yang digunakan sekarang:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Teardrop Chat Verification</title>
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            
            <tr>
              <td style="text-align:center;padding-bottom:24px;">
                <h2 style="margin:0;font-size:20px;font-weight:600;">
                  Teardrop Chat
                </h2>
              </td>
            </tr>

            <tr>
              <td style="font-size:14px;line-height:1.6;color:#374151;padding-bottom:20px;">
                Use the verification code below to sign in.
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:16px 0;">
                <div style="font-size:32px;font-weight:700;letter-spacing:6px;color:#111827;">
                  {{ .Token }}
                </div>
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;color:#6b7280;padding-top:16px;">
                This code expires in <strong>60 seconds</strong>.
                If you did not request this code, please ignore this email.
              </td>
            </tr>

            <tr>
              <td style="padding-top:32px;font-size:12px;color:#9ca3af;text-align:center;">
                © Teardrop Chat
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Note**: Template ini sudah di-apply di Supabase Dashboard dengan:
- Clean, modern design
- **60 seconds expiry** (sesuai frontend countdown)
- Mobile-responsive
- Professional styling

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
- OTP expired (60 seconds configured, tapi Supabase default 1 hour - customize di dashboard)
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
