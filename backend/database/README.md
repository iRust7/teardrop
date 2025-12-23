# Trustdrop Chat Backend - Database Setup

## Setup Instructions

### 1. Create Tables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and run the SQL script

This will create:
- ✅ `users` table
- ✅ `messages` table
- ✅ `typing_indicators` table
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamps
- ✅ Row Level Security policies

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Seeding

```bash
npm run seed
```

This will create:
- **1 Admin account** (admin@trustdrop.chat / Admin123!)
- **5 Test users** (john@example.com, jane@example.com, etc. / Test123!)
- **Sample messages** between users

### 5. Start Backend Server

```bash
npm run dev    # Development mode with auto-reload
npm start      # Production mode
```

## Database Schema

### Users Table
- `id` - UUID primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Bcrypt hashed password
- `role` - user | admin | moderator
- `status` - online | offline | away
- `bio` - User bio
- `avatar_url` - Profile picture URL
- `last_seen` - Last activity timestamp
- `created_at` - Account creation date
- `updated_at` - Last update timestamp

### Messages Table
- `id` - UUID primary key
- `user_id` - Sender user ID
- `receiver_id` - Receiver user ID
- `content` - Message content
- `is_read` - Read status
- `read_at` - When message was read
- `created_at` - Message sent time
- `updated_at` - Last update timestamp

## Test Accounts

After seeding, you can login with:

**Admin Account:**
- Email: `admin@trustdrop.chat`
- Password: `Admin123!`

**Test Users:**
- `john@example.com` / Test123!
- `jane@example.com` / Test123!
- `bob@example.com` / Test123!
- `alice@example.com` / Test123!
- `charlie@example.com` / Test123!

## API Endpoints

### Auth Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `POST /change-password` - Change password
- `POST /refresh-token` - Refresh JWT token

### User Routes (`/api/users`)
- `GET /` - Get all users
- `GET /search?q=query` - Search users
- `GET /online` - Get online users
- `GET /:id` - Get user by ID
- `PUT /status` - Update user status
- `DELETE /:id` - Delete user (admin only)
- `PUT /:id/role` - Update user role (admin only)

### Message Routes (`/api/messages`)
- `POST /` - Send message
- `GET /` - Get user messages
- `GET /conversations/recent` - Get recent conversations
- `GET /unread-count` - Get unread count
- `GET /search?q=query` - Search messages
- `GET /conversation/:userId` - Get conversation with user
- `PUT /:id/read` - Mark message as read
- `PUT /conversation/:userId/read` - Mark conversation as read
- `DELETE /:id` - Delete message

## Troubleshooting

### Table not found error
Run the `schema.sql` script in Supabase SQL Editor first.

### Permission denied error
Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file.

### Seeding fails
Check that your Supabase credentials are correct and tables exist.
