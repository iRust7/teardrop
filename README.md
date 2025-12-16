# Teardrop Chat 💬

Real-time chat application with Google OAuth, OTP verification, file sharing, and emoji support using Supabase.

## 🏗️ Architecture

```
teardrop-chat/
├── frontend/          # React + TypeScript + Vite
│   └── port: 3001
├── backend/          # Node.js + Express + Supabase
│   └── port: 3002
└── Supabase         # Database + Auth
```

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```
Backend runs on **http://localhost:3002**

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:3001**

### 3. Setup Database
Run the SQL schema in Supabase:
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the script from `backend/supabase-schema.sql`

## ⚙️ Configuration

### Backend (.env)
Located at `backend/.env`:
```env
PORT=3002
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://bhnqnwsztprgssxekxvz.supabase.co
SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***
JWT_SECRET=your-secret
```

### Frontend (.env)
Located at `frontend/.env`:
```env
VITE_API_URL=http://localhost:3002/api
```

## ✨ Features

- 💬 Real-time messaging with Supabase Realtime
- � **OTP Email Login** - 6-digit code sent via Gmail
- 📎 File sharing (images, documents) with Supabase Storage
- 😊 Emoji picker with 24 common emojis
- 👥 User list with online/offline status
- 🔔 Message notifications
- 📱 Responsive design

## 🔐 Security

- ✅ Credentials stored in backend only
- ✅ Service role key never exposed to frontend
- ✅ CORS configured for frontend URL
- ✅ JWT token management
- ✅ Row Level Security in Supabase
- ✅ **Google OAuth 2.0 Integration**
- ✅ **OTP Email Verification** (10-minute expiry)
- ✅ Rate limiting on auth endpoints
- ✅ Secure file storage with access policies

## 🔑 Authentication Methods

### 1. Email & Password
Traditional login with hashed passwords

### 2. OTP Email via Gmail
Passwordless login with 6-digit OTP code sent via Gmail - See [GMAIL_OTP_SETUP.md](GMAIL_OTP_SETUP.md)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/otp/send` - **Send OTP code via Gmail**
- `POST /api/auth/otp/verify` - **Verify OTP code and login**

### Users
- `GET /api/users` - Get all users

### Messages
- `GET /api/messages?userId=xxx` - Get messages for user
- `POST /api/messages` - Send text message
- `POST /api/messages/upload` - **Upload file (image/document)**

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios

**Backend:**
- Node.js + Express
- Supabase Client (Auth, Database, Storage, Realtime)
- Multer (file uploads)
- CORS + JWT
- Rate limiting

**Database:**
- Supabase PostgreSQL
- Row Level Security
- Realtime subscriptions

**Storage:**
- Supabase Storage (chat-files bucket)
- 10MB file size limit

## 📝 Development

### Backend Scripts
```bash
npm start       # Start server
npm run dev     # Start with auto-reload
```

### Frontend Scripts
```bash
npm run dev     # Start dev server
npm run build   # Build for production
```

## 🚀 Quick Setup for OTP Email

### Gmail OTP Setup  
See **[GMAIL_OTP_SETUP.md](GMAIL_OTP_SETUP.md)** for step-by-step guide.

Quick steps:
1. Buat Gmail baru untuk aplikasi
2. Aktifkan 2-Step Verification
3. Generate App Password (16 digit)
4. Update backend `.env`:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
5. Restart backend dan test kirim OTP

## 📦 Database Migrations

Run these in order:
1. `backend/database/add-file-support.sql` - File messaging support
2. `backend/database/enable-realtime.sql` - Realtime subscriptions
3. `backend/database/add-oauth-otp-support.sql` - OAuth and OTP support

## ✅ Production Ready

- ❌ Removed MongoDB dependencies
- ❌ Removed Socket.IO
- ❌ Removed direct Supabase client from frontend
- ❌ Removed old server files
- ✅ Clean separation: Backend ↔ Frontend
- ✅ Secure credential management
- ✅ Backend service ready to start independently

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))

## 📄 License

MIT


MIT


### 3. Setup Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend


## 📄 License

MIT

5. **Real-time updates** - Messages appear instantly for both users

## 🏗️ Database Schema

### Users Table
```sql
- id: UUID (Primary Key)
- username: VARCHAR(255) (Unique)
- email: VARCHAR(255) (Unique)
- password_hash: VARCHAR(255)
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Messages Table
```sql
- id: UUID (Primary Key)
- content: TEXT
- sender_id: UUID (Foreign Key to users.id)
- receiver_id: UUID (Foreign Key to users.id)
- is_read: BOOLEAN
- created_at: TIMESTAMP
```

## 🔧 Development

### Frontend Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint


## 📄 License

MIT

- Check that you ran the database schema SQL
- Verify Realtime is enabled in Supabase Dashboard > Database > Replication
- Check browser console for subscription errors

## 📄 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Supabase
