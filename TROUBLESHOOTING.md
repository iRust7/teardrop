# 🚨 ERR_INSUFFICIENT_RESOURCES - TROUBLESHOOTING GUIDE

## What's Happening?

You're getting `ERR_INSUFFICIENT_RESOURCES` and `ERR_NETWORK` errors when trying to connect to your Railway backend.

## Root Causes

1. **Railway Free Tier Sleeping** - Railway apps sleep after 5 minutes of inactivity
2. **Too Many Simultaneous Requests** - Frontend was firing 3+ requests simultaneously on load
3. **Server Cold Start** - First request takes 30-60 seconds to wake up the server
4. **Network Issues** - Temporary connectivity problems

## Fixes Applied

### 1. ✅ Added Retry Logic (`frontend/src/utils/api.ts`)
- Automatic retry with exponential backoff
- 30-second timeout for requests
- Retries network errors up to 2 times

### 2. ✅ Reduced Simultaneous Requests (`frontend/src/context/ChatContext.tsx`)
- Sequential loading: Users → wait 300ms → Messages
- Prevents overwhelming server on cold start

### 3. ✅ Improved CORS Configuration (`backend/server.js`)
- Added explicit methods and headers
- Better localhost support for development

## How to Test

### Option 1: Test Backend First
1. Open `test-backend.html` in your browser
2. Click "Test Health Endpoint"
3. Wait for response (may take 30-60 seconds on first try)
4. If successful, backend is running

### Option 2: Run Locally

#### Backend:
```bash
cd backend
npm install
npm start
```

#### Frontend (in new terminal):
```bash
cd frontend
npm install
npm run dev
```

Then update `frontend/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

## Railway Deployment Checklist

### Backend Environment Variables (Railway Dashboard)
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000,https://your-frontend-domain.com
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-strong-random-secret
```

### Common Issues

#### 1. "Railway app is sleeping"
**Solution:** First request takes 30-60 seconds. Just wait.

#### 2. "CORS error"
**Solution:** Add your frontend URL to `FRONTEND_URL` environment variable in Railway dashboard:
```
FRONTEND_URL=http://localhost:3000,https://your-vercel-app.vercel.app
```

#### 3. "Server not responding"
**Solution:** 
- Check Railway dashboard - is app running?
- Check deployment logs for errors
- Verify all environment variables are set

#### 4. "Still getting network errors"
**Solution:** Run backend locally:
```bash
cd backend
npm start
```
Update frontend `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

## Testing Flow

1. **Health Check First**
   - Open: https://teardrop-production.up.railway.app/health
   - Wait 30-60 seconds if needed
   - Should return: `{"status":"OK",...}`

2. **If Health Check Works**
   - Start frontend: `cd frontend && npm run dev`
   - Login/Register should work
   - Messages should load (with retry)

3. **If Health Check Fails**
   - Check Railway dashboard
   - Check deployment logs
   - Run backend locally instead

## Quick Fix Commands

### Reset Everything:
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Test Backend Health:
```bash
curl https://teardrop-production.up.railway.app/health
```

## Expected Behavior After Fixes

1. **First Load** - May take 30-60 seconds (Railway cold start)
2. **Retry Messages** - Console shows "Retrying request..." 
3. **Eventually Succeeds** - App loads after retries
4. **Subsequent Loads** - Fast (server is warm)

## Still Not Working?

1. Check Railway dashboard for errors
2. Check browser console for specific error messages
3. Try running both backend and frontend locally
4. Verify Supabase credentials are correct
