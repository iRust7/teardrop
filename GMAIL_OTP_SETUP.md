# 📧 Cara Setup Gmail untuk OTP

Tutorial lengkap setup Gmail App Password untuk mengirim kode OTP.

## 🎯 Langkah-langkah

### 1. Buat Gmail Baru (Recommended)

Buat akun Gmail khusus untuk aplikasi, jangan pakai Gmail pribadi.

Contoh: `teardropchat.otp@gmail.com`

**Kenapa perlu Gmail baru?**
- Lebih aman (tidak pakai password Gmail utama)
- Mudah monitoring email yang dikirim
- Bisa disesuaikan nama pengirim

### 2. Aktifkan 2-Step Verification

1. Login ke Gmail baru kamu
2. Buka [Google Account Settings](https://myaccount.google.com/)
3. Pilih **Security** (Keamanan)
4. Cari **2-Step Verification** (Verifikasi 2 Langkah)
5. Klik **Get Started** dan ikuti petunjuknya
6. Verifikasi pakai nomor HP kamu

**PENTING:** App Password hanya bisa dibuat kalau 2-Step Verification sudah aktif!

### 3. Buat App Password

1. Masih di halaman **Security**
2. Cari **App passwords** (Password aplikasi)
3. Mungkin diminta login lagi untuk verifikasi
4. Pilih **Select app** → Pilih **Mail**
5. Pilih **Select device** → Pilih **Other (Custom name)**
6. Ketik nama: `Teardrop Chat OTP`
7. Klik **Generate**
8. Google akan tampilkan **16 digit password** seperti: `abcd efgh ijkl mnop`
9. **COPY PASSWORD INI!** (tidak bisa dilihat lagi nanti)

### 4. Setup di Backend

Edit file `backend/.env`:

```env
# Gmail Configuration for OTP
GMAIL_USER=teardropchat.otp@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Catatan:**
- `GMAIL_USER` = email Gmail yang kamu buat
- `GMAIL_APP_PASSWORD` = 16 digit password (hapus spasi)
- Contoh password: `abcd efgh ijkl mnop` → tulis jadi `abcdefghijklmnop`

### 5. Test Kirim Email

Restart backend server:

```powershell
cd backend
npm run dev
```

Backend akan otomatis test koneksi Gmail saat startup.

Cek di console:
```
[EMAIL] Gmail connection verified successfully ✅
```

Kalau gagal:
```
[EMAIL] Gmail connection failed ❌
```

### 6. Test dari Frontend

1. Buka `http://localhost:3001`
2. Klik **"Sign in with Email"**
3. Masukkan email user yang sudah terdaftar
4. Klik **"Send OTP"**
5. Cek email → Kamu akan terima email dengan kode OTP 6 digit
6. Masukkan kode OTP
7. Klik **"Verify OTP"**
8. Login berhasil! 🎉

## 📧 Contoh Email yang Dikirim

```
From: Teardrop Chat <teardropchat.otp@gmail.com>
To: user@example.com
Subject: 🔐 Kode OTP Login Teardrop Chat

Kode OTP kamu adalah:

┌─────────────┐
│   123456    │
└─────────────┘

Berlaku selama 10 menit
```

## 🔧 Troubleshooting

### "Invalid login" / "Username and Password not accepted"

**Solusi:**
1. Pastikan 2-Step Verification sudah aktif
2. Buat App Password baru (yang lama mungkin expired)
3. Copy paste App Password dengan benar (tanpa spasi)
4. Restart backend server

### "Less secure apps"

Google sudah tidak support "Less secure apps" sejak Mei 2022.
**Harus pakai App Password!**

### Email tidak masuk

1. Cek spam folder
2. Cek backend console untuk error log
3. Pastikan Gmail kamu tidak kena limit (max 500 email/hari)
4. Test kirim email manual pakai Nodemailer

### Connection timeout

**Solusi:**
1. Cek internet connection
2. Pastikan firewall tidak block port 587/465
3. Coba restart backend

## 🚀 Production Deployment

### Railway (Backend)

Tambahkan environment variables di Railway:

```
GMAIL_USER=teardropchat.otp@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
NODE_ENV=production
```

### Vercel (Frontend)

Tidak perlu setting apa-apa di Vercel, semua handle di backend.

## 📊 Limit Gmail

**Free Gmail Account:**
- Max 500 emails per hari
- Max 2000 emails per bulan (untuk new account)
- Rate limit: ~20 email per menit

**Tips:**
- Pakai 1 Gmail untuk development
- Pakai Gmail berbeda untuk production
- Monitor email sent counter

## 🔐 Keamanan

**DO:**
- ✅ Simpan App Password di .env (jangan commit ke git!)
- ✅ Buat Gmail khusus untuk aplikasi
- ✅ Monitor email logs
- ✅ Set rate limiting di backend (sudah ada)

**DON'T:**
- ❌ Jangan hardcode password di code
- ❌ Jangan pakai Gmail pribadi
- ❌ Jangan share App Password
- ❌ Jangan commit .env ke git

## 💡 Tips & Tricks

### 1. Custom Email Template

Edit file `backend/src/utils/emailService.js` untuk customize design email.

### 2. Multiple Languages

Bisa tambah parameter `language` untuk kirim email dalam bahasa berbeda.

### 3. Email Logging

Semua email yang dikirim di-log di backend console:
```
[EMAIL] OTP sent to user@example.com: <message-id>
```

### 4. Development Mode

Di development mode, kalau Gmail gagal kirim, OTP akan muncul di response API:
```json
{
  "data": {
    "email": "user@example.com",
    "otp": "123456"
  }
}
```

Jadi bisa test tanpa cek email.

## 📝 Checklist

Sebelum deploy production:

- [ ] Gmail baru sudah dibuat
- [ ] 2-Step Verification sudah aktif
- [ ] App Password sudah dibuat
- [ ] .env sudah diupdate
- [ ] Test kirim email berhasil
- [ ] Email design sudah OK
- [ ] Production env vars sudah diset di Railway
- [ ] Rate limiting sudah ditest
- [ ] Spam folder sudah dicek

## 🎯 Alternative Email Service

Kalau Gmail limit tidak cukup atau butuh fitur lebih:

1. **SendGrid** - 100 email/hari gratis
2. **Mailgun** - 5000 email/bulan gratis (3 bulan pertama)
3. **AWS SES** - $0.10 per 1000 email
4. **Resend** - 3000 email/bulan gratis

Tapi untuk start, Gmail App Password sudah cukup! 👍

## 🆘 Support

Masih bingung? Cek:
- [Google App Password Guide](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Setup](https://nodemailer.com/usage/using-gmail/)

---

**Happy Coding! 🚀**
