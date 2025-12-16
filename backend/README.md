# 🚀 Teardrop Chat - Backend API

Backend RESTful API untuk aplikasi chat real-time dengan Node.js, Express, dan Supabase.

## 📋 Fitur

- ✅ **Autentikasi & Otorisasi** - JWT-based authentication dengan role-based access control
- ✅ **User Management** - CRUD operations, profile management, status updates
- ✅ **Real-time Messaging** - Send dan receive messages dengan tracking baca/belum baca
- ✅ **Search & Filter** - Cari users dan messages
- ✅ **Admin Panel** - Admin dashboard untuk user management
- ✅ **Database Seeding** - Automatic seeding untuk test accounts dan sample data
- ✅ **Error Handling** - Comprehensive error handling dan validation
- ✅ **Security** - Password hashing dengan bcrypt, rate limiting, CORS protection

## 🏗️ Struktur Proyek

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Konfigurasi Supabase
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── userController.js    # User management
│   │   └── messageController.js # Message handling
│   ├── middleware/
│   │   ├── auth.js              # Authentication & authorization
│   │   └── errorHandler.js      # Error handling middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Message.js           # Message model
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── users.js             # User routes
│   │   └── messages.js          # Message routes
│   ├── services/                # Business logic services
│   └── utils/
│       ├── jwt.js               # JWT utilities
│       ├── password.js          # Password hashing
│       └── helpers.js           # Helper functions
├── seeds/
│   └── seed.js                  # Database seeding script
├── database/
│   ├── schema.sql               # Database schema
│   └── README.md                # Database documentation
├── server.js                    # Main server file
├── package.json
└── .env                         # Environment variables

```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v18+ 
- npm atau yarn
- Supabase account

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Setup Database

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `database/schema.sql`
3. Paste dan jalankan script

### 4. Configure Environment

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan kredensial Supabase Anda:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
JWT_SECRET=your-secret-key
```

### 5. Seed Database

```bash
npm run seed
```

Output:
```
🌱 Starting database seeding...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗑️  Clearing existing data...
✓ Messages cleared
✓ Users cleared

👥 Creating users...
  👑 admin (admin@teardrop.chat) - Password: Admin123!
  👤 john_doe (john@example.com) - Password: Test123!
  👤 jane_smith (jane@example.com) - Password: Test123!
  ...

💬 Creating test messages...
  ✓ john_doe → jane_smith: "Hey Jane! How are you doing?"
  ...

✅ Database seeding completed successfully!
```

### 6. Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di: `http://localhost:3001`

## 🔑 Test Accounts

### Admin Account
```
Email: admin@teardrop.chat
Password: Admin123!
Role: admin
```

### Test Users
```
john@example.com    / Test123!  (user)
jane@example.com    / Test123!  (user)
bob@example.com     / Test123!  (user)
alice@example.com   / Test123!  (moderator)
charlie@example.com / Test123!  (user)
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3001
```

### Health Check
```http
GET /health
```

### Authentication (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "online"
    },
    "token": "jwt-token-here"
  },
  "message": "Login successful"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "bio": "My new bio",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Users (`/api/users`)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>

# With filters
GET /api/users?status=online
GET /api/users?role=admin
```

#### Search Users
```http
GET /api/users/search?q=john
Authorization: Bearer <token>
```

#### Get Online Users
```http
GET /api/users/online
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User Status
```http
PUT /api/users/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "away"  // online | offline | away
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

#### Update User Role (Admin Only)
```http
PUT /api/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "moderator"  // user | admin | moderator
}
```

### Messages (`/api/messages`)

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": "user-uuid",
  "content": "Hello! How are you?"
}
```

#### Get User Messages
```http
GET /api/messages?limit=100
Authorization: Bearer <token>
```

#### Get Conversation
```http
GET /api/messages/conversation/:userId?limit=50&offset=0
Authorization: Bearer <token>
```

#### Get Recent Conversations
```http
GET /api/messages/conversations/recent
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /api/messages/unread-count
Authorization: Bearer <token>
```

#### Search Messages
```http
GET /api/messages/search?q=hello
Authorization: Bearer <token>
```

#### Mark Message as Read
```http
PUT /api/messages/:id/read
Authorization: Bearer <token>
```

#### Mark Conversation as Read
```http
PUT /api/messages/conversation/:userId/read
Authorization: Bearer <token>
```

#### Delete Message
```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

Semua protected endpoints memerlukan JWT token di header:

```
Authorization: Bearer <your-jwt-token>
```

Token akan expired setelah 7 hari. Gunakan endpoint `/api/auth/refresh-token` untuk mendapatkan token baru.

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message",
  "timestamp": "2025-12-16T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": "Detailed error (development only)",
  "timestamp": "2025-12-16T10:00:00.000Z"
}
```

## 🛡️ Security Features

- **Password Hashing**: Bcrypt dengan 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 10 requests per minute untuk auth endpoints
- **CORS Protection**: Configured untuk frontend URL
- **Input Validation**: Semua inputs divalidasi
- **SQL Injection Protection**: Supabase parameterized queries
- **Role-Based Access Control**: Admin, moderator, dan user roles

## 🧪 Testing

Test backend API menggunakan:

### Postman / Thunder Client

Import collection dengan endpoints di atas.

### cURL Examples

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teardrop.chat","password":"Admin123!"}'

# Get users (dengan token)
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Scripts

```bash
npm start          # Start server (production)
npm run dev        # Start server (development dengan auto-reload)
npm run seed       # Seed database dengan test data
npm run seed:force # Force seed (clear dan re-seed)
```

## 🐛 Troubleshooting

### Error: "Table not found"
→ Jalankan `database/schema.sql` di Supabase SQL Editor

### Error: "Invalid credentials"
→ Check file `.env` dan pastikan kredensial Supabase benar

### Error: "Port already in use"
→ Ubah PORT di `.env` atau kill process di port 3001

### Seeding fails
→ Pastikan tabel sudah dibuat dan credentials benar

## 📖 Documentation

- [Database Schema](./database/README.md)
- [API Documentation](./docs/API.md) (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) (coming soon)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- Express.js team
- Node.js community
