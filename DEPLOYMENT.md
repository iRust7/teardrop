# Teardrop Chat - Deployment Guide

## 🚀 Deployment Overview

This guide will help you deploy the Teardrop Chat application to production. The backend can be deployed to platforms like Render, Railway, or Heroku, while the frontend can be deployed to Vercel, Netlify, or similar services.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Supabase Project** - Database and authentication setup
2. ✅ **GitHub Repository** - Code pushed to GitHub
3. ✅ **Accounts Created** - Deployment platform accounts (Vercel, Render, etc.)

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project credentials

### Step 2: Run Database Schema

1. Open **SQL Editor** in Supabase Dashboard
2. Copy the contents from `backend/database/schema.sql`
3. Run the SQL script to create tables

### Step 3: Get Supabase Credentials

You'll need these for backend deployment:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)

Find these in: **Settings → API → Project URL and API Keys**

---

## 🔧 Backend Deployment

### Option 1: Deploy to Render

1. **Create Account** at [render.com](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select `backend` as root directory
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=generate-strong-random-string
   ```

4. **Deploy** - Render will automatically deploy your backend

5. **Copy Backend URL** - You'll need this for frontend (e.g., `https://teardrop-backend.onrender.com`)

### Option 2: Deploy to Railway

1. **Create Account** at [railway.app](https://railway.app)

2. **New Project → Deploy from GitHub**
   - Select your repository
   - Railway auto-detects Node.js

3. **Configure**
   - Root directory: `backend`
   - Start command: `npm start`

4. **Add Environment Variables** (same as Render above)

5. **Generate Domain** and copy the URL

---

## 🌐 Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Create Account** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

5. **Deploy** - Vercel will build and deploy your frontend

6. **Copy Frontend URL** - Update backend `FRONTEND_URL` with this

### Option 2: Deploy to Netlify

1. **Create Account** at [netlify.com](https://netlify.com)

2. **New Site from Git**
   - Connect GitHub
   - Select repository

3. **Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

5. **Deploy Site**

---

## 🔄 Update Cross-Origin URLs

After deploying both frontend and backend:

### Update Backend Environment
Go to your backend deployment (Render/Railway) and update:
```
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

### Update Frontend Environment
Go to your frontend deployment (Vercel/Netlify) and update:
```
VITE_API_URL=https://your-actual-backend-url.onrender.com/api
```

**Important:** Redeploy both services after updating environment variables!

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random string (use generator)
- [ ] Verify CORS settings allow only your frontend URL
- [ ] Enable Supabase Row Level Security (RLS) policies
- [ ] Review Supabase service role key is kept secret
- [ ] Check that `.env` files are in `.gitignore`
- [ ] Verify no sensitive data in Git history

### Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 Testing Deployment

1. **Test Backend**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"OK",...}`

2. **Test Frontend**
   - Open your frontend URL
   - Try registering a new user
   - Send a test message

3. **Check Logs**
   - Backend: Check Render/Railway logs for errors
   - Frontend: Check browser console for issues

---

## 📊 Monitoring

### Backend Logs
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → View Logs

### Frontend Logs
- **Vercel**: Project → Deployments → Function Logs
- **Netlify**: Site → Deploys → Deploy Log

---

## 🛠️ Common Issues

### CORS Errors
**Problem:** Frontend can't reach backend  
**Solution:** Verify `FRONTEND_URL` in backend matches deployed frontend URL

### Database Connection Fails
**Problem:** Can't connect to Supabase  
**Solution:** Check `SUPABASE_URL` and keys are correct

### Build Fails
**Problem:** Deployment build errors  
**Solution:** 
- Ensure `package.json` dependencies are correct
- Run `npm install` locally to verify
- Check build logs for specific errors

### Environment Variables Not Loading
**Problem:** App can't find config  
**Solution:** Redeploy after adding environment variables

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all features (register, login, chat)
2. ✅ Set up custom domain (optional)
3. ✅ Enable HTTPS (usually automatic)
4. ✅ Monitor application logs
5. ✅ Set up error tracking (Sentry, LogRocket, etc.)

---

## 📞 Support

If you encounter issues:
- Check deployment platform documentation
- Review application logs
- Verify environment variables
- Test Supabase connection directly

---

## 🔄 Continuous Deployment

Both Vercel and Render/Railway support automatic deployments:

- Push to `main` branch → Auto-deploy
- Pull requests → Preview deployments
- Rollback to previous versions if needed

Configure branch deployments in your platform settings.

---

## 📝 Environment Variables Summary

### Backend (.env)
```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-generated-secret-key
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

**Good luck with your deployment! 🚀**
