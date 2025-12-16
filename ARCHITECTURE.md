# Teardrop Chat - Architecture

## System Overview

Teardrop Chat is a real-time chat application that uses Supabase as a Backend-as-a-Service (BaaS) platform. The application follows a modern client-side architecture where the frontend communicates directly with Supabase services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React + TypeScript + Vite                  │ │
│  │                                                          │ │
│  │  ┌───────────┐  ┌──────────┐  ┌──────────────────────┐│ │
│  │  │Components │  │ Context  │  │  Supabase Client     ││ │
│  │  │  - UI     │◄─┤ChatContext├─►│  - Auth              ││ │
│  │  │  - Forms  │  │          │  │  - Database          ││ │
│  │  │  - Lists  │  └──────────┘  │  - Realtime          ││ │
│  │  └───────────┘                 └──────────────────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │   Auth     │  │ PostgreSQL │  │  Realtime Server       ││
│  │  Service   │  │  Database  │  │  (WebSocket)           ││
│  │            │  │            │  │                        ││
│  │ - Sign up  │  │ - users    │  │ - Message broadcast    ││
│  │ - Sign in  │  │ - messages │  │ - Presence channels    ││
│  │ - JWT      │  │ - RLS      │  │ - Subscriptions        ││
│  └────────────┘  └────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **@supabase/supabase-js** - Supabase JavaScript client

### Backend (Supabase)
- **PostgreSQL** - Relational database
- **PostgREST** - REST API layer
- **Realtime Server** - WebSocket subscriptions
- **GoTrue** - JWT-based authentication
- **Row Level Security (RLS)** - Database-level authorization

## Data Flow

### Authentication Flow
```
1. User submits credentials
2. Frontend calls authAPI.login/register
3. Supabase Auth validates credentials
4. Returns JWT token + user data
5. Frontend stores session
6. All subsequent requests include JWT
```

### Message Sending Flow
```
1. User types message and clicks send
2. ChatContext calls messagesAPI.createMessage()
3. Supabase validates JWT and RLS policies
4. Message inserted into database
5. Realtime server broadcasts to subscribers
6. Frontend receives via subscription
7. UI updates with new message
```

### Realtime Subscription Flow
```
1. Component mounts, calls subscribeToMessages()
2. Supabase client opens WebSocket connection
3. Client subscribes to 'messages' table changes
4. Server broadcasts INSERT/UPDATE/DELETE events
5. Callback function processes new data
6. React state updates, UI re-renders
```

## Component Structure

```
App.tsx
└── ChatProvider (Context)
    ├── LoginForm (Unauthenticated)
    ├── RegisterForm (Unauthenticated)
    └── ChatWindow (Authenticated)
        ├── Header
        ├── MessageList
        │   └── MessageItem[]
        ├── MessageInput
        └── UserList
            └── UserAvatar[]
```

## Database Schema

### Users Table
- Primary authentication data stored in `auth.users` (Supabase)
- Extended profile in `public.users`:
  - `id` (UUID, FK to auth.users)
  - `username` (unique)
  - `email` (unique)
  - `avatar_url` (optional)
  - Timestamps

### Messages Table
- `id` (UUID, PK)
- `content` (text)
- `sender_id` (UUID, FK to users.id)
- `receiver_id` (UUID, FK to users.id)
- `is_read` (boolean)
- `created_at` (timestamp)

### Relationships
- One user can send many messages (1:N)
- One user can receive many messages (1:N)
- Messages form conversations between two users

## Security Model

### Row Level Security (RLS)

#### Users Table
```sql
- SELECT: Anyone authenticated can view all profiles
- UPDATE: Users can only update their own profile
- INSERT: Handled by auth trigger
- DELETE: Not allowed
```

#### Messages Table
```sql
- SELECT: Users can only see messages they sent or received
- INSERT: Users can only insert messages with their ID as sender
- UPDATE: Users can only update messages they received (for read status)
- DELETE: Not allowed
```

### Authentication
- JWT tokens issued by Supabase Auth
- Tokens expire after configured time (default 1 hour)
- Refresh tokens used for silent renewal
- All API calls validate JWT

## State Management

### Context API (ChatContext)
Centralized state management for:
- Current user
- Messages list
- Users list
- Connection status
- Selected conversation

### Local State
Component-level state for:
- Form inputs
- UI interactions
- Temporary data

## Real-time Features

### Supabase Realtime
- WebSocket connection to Supabase
- Subscribe to database changes
- Automatic reconnection
- Event filtering by table/operation

### Message Broadcasting
1. User sends message
2. Inserted into database
3. Realtime server detects INSERT
4. Broadcasts to all subscribers
5. Subscribers receive via callback
6. UI updates automatically

## API Layer

### API Structure (`src/utils/api.ts`)
```typescript
authAPI
  ├── register()
  ├── login()
  ├── logout()
  ├── getCurrentUser()
  └── getSession()

usersAPI
  ├── getAllUsers()
  └── getOnlineUsers()

messagesAPI
  ├── getMessages()
  ├── getConversation()
  ├── createMessage()
  ├── markAsRead()
  └── subscribeToMessages()
```

## Deployment Architecture

### Frontend Deployment
- Static site hosting (Vercel, Netlify, etc.)
- CDN for assets
- Environment variables for Supabase config

### Backend (Supabase)
- Fully managed by Supabase
- Multi-region availability
- Automatic backups
- SSL/TLS certificates

## Performance Optimizations

1. **Database Indexes**
   - Index on sender_id and receiver_id
   - Index on created_at for sorting

2. **Query Optimization**
   - Select only needed fields
   - Use proper joins for relations

3. **Frontend Optimization**
   - React memoization (useMemo, useCallback)
   - Virtual scrolling for long message lists
   - Lazy loading components

4. **Real-time Optimization**
   - Single WebSocket connection
   - Event filtering at server level
   - Debounced typing indicators

## Future Enhancements

- [ ] File sharing/attachments
- [ ] Group chat support
- [ ] Voice/video calls
- [ ] Message reactions
- [ ] Message search
- [ ] Presence system (typing, online status)
- [ ] Push notifications
- [ ] Message encryption

## Development Workflow

1. **Local Development**
   - Frontend runs on Vite dev server (localhost:5173)
   - Connects to Supabase cloud project
   - Hot module replacement (HMR)

2. **Testing**
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests for critical flows

3. **Deployment**
   - Push to Git repository
   - CI/CD pipeline builds frontend
   - Deploy to hosting platform
   - Environment variables configured

## Monitoring & Logging

### Frontend
- Browser console logs
- Error boundaries
- Performance monitoring

### Backend (Supabase)
- Dashboard analytics
- Real-time connection stats
- Query performance metrics
- Error logs in dashboard
