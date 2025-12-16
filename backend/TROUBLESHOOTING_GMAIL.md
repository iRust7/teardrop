# 🔧 Troubleshooting Gmail SMTP - App Password Invalid

## ❌ Error yang Terjadi
```
535-5.7.8 Username and Password not accepted
```

## ✅ Solusi

### Langkah 1: Verifikasi 2-Step Verification
1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Login dengan akun: **mrx0051@gmail.com**
3. Cari bagian **"How you sign in to Google"**
4. Pastikan **"2-Step Verification"** sudah **ON** (aktif)
5. Jika belum aktif, klik dan aktifkan sekarang

### Langkah 2: Hapus App Password Lama (jika ada)
1. Di halaman Security yang sama
2. Scroll ke bawah, cari **"App passwords"**
3. Hapus semua app password yang lama (Teardrop Chat, dll)

### Langkah 3: Buat App Password Baru
1. Klik **"App passwords"** di halaman Security
2. Pilih **"Select app"** → Pilih **"Mail"** atau **"Other"**
3. Ketik nama: **"Teardrop Chat OTP"**
4. Klik **"Generate"**
5. **COPY** 16 karakter password yang muncul (contoh: `abcd efgh ijkl mnop`)

### Langkah 4: Update .env File
Edit file `.env` di folder `backend`:

```env
GMAIL_USER=mrx0051@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

⚠️ **PENTING**: 
- Hilangkan semua spasi dari App Password
- Gunakan 16 karakter tanpa spasi
- Jangan gunakan password Gmail biasa

### Langkah 5: Test Koneksi
```powershell
cd backend
npm run dev
```

Cek log server, harusnya muncul:
```
📧 Gmail OTP Service: ✓ Connected
   • Email: mrx0051@gmail.com
```

---

## 🔗 Link Penting
- [Google App Passwords](https://myaccount.google.com/apppasswords)
- [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

## 📝 Catatan
- App Password berbeda dengan password Gmail biasa
- 1 App Password hanya bisa digunakan untuk 1 aplikasi
- Jika App Password bocor, langsung hapus dan buat yang baru
