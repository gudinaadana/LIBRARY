# 🚀 Deploy MWU DIGITAL LIBRARY to Render.com

## ⚠️ IMPORTANT: Your Current Issue

Your deployment only built the **frontend**, but it's looking for files in the wrong location. Also, the **backend (PHP/Laravel)** is not deployed yet.

## 🎯 Solution: Deploy Frontend and Backend Separately

---

## 📋 Prerequisites

1. ✅ GitHub repository: https://github.com/gudinaadana/LIBRARY
2. ✅ Render.com account (free tier available)
3. ✅ Both frontend and backend need separate deployments

---

## 🔧 STEP 1: Fix Frontend Configuration

The frontend needs to point to your deployed backend URL.

### Update Environment Variable

In Render dashboard for your frontend service:
1. Go to "Environment" tab
2. Add this variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.onrender.com/api.php`

---

## 🌐 STEP 2: Deploy Backend (PHP/Laravel)

### Option A: Using Render Dashboard

1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mwu-library-backend`
   - **Environment**: `Docker` or `PHP`
   - **Build Command**: `composer install --no-dev`
   - **Start Command**: `php -S 0.0.0.0:$PORT -t public`
   - **Root Directory**: Leave empty (root)

5. Add Environment Variables:
   ```
   APP_ENV=production
   APP_DEBUG=false
   DB_CONNECTION=mysql
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_DATABASE=mwu_library
   DB_USERNAME=your-db-user
   DB_PASSWORD=your-db-password
   ```

### Option B: Deploy Backend to Different Platform

Since Render's free tier has limited PHP support, consider:
- **Heroku** (better PHP support)
- **Railway.app** (easy PHP deployment)
- **000webhost** (free PHP hosting)

---

## 🎨 STEP 3: Update Frontend Deployment

### Current Issue:
Your frontend is deployed at: https://library-2-x5uh.onrender.com
But it's building from root instead of `frontend/` folder.

### Fix in Render Dashboard:

1. Go to your frontend service settings
2. Update these settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18.17.0`

3. Add Environment Variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.onrender.com/api.php`

4. Click "Manual Deploy" → "Deploy latest commit"

---

## 🗄️ STEP 4: Setup Database

### Option A: Render PostgreSQL (Free)
1. In Render Dashboard → "New +" → "PostgreSQL"
2. Create database
3. Copy connection details to backend environment variables

### Option B: External MySQL
Use services like:
- **PlanetScale** (free MySQL)
- **Railway** (free MySQL)
- **Clever Cloud** (free MySQL)

Then update backend environment variables with connection details.

---

## 🔄 STEP 5: Import Database Tables

After database is created:

1. Connect to your database using provided credentials
2. Run the SQL from `CREATE_DATABASE_TABLES.sql`
3. Or use migration commands if available

---

## ✅ STEP 6: Test Your Deployment

1. Backend URL: `https://your-backend.onrender.com/api.php`
2. Frontend URL: `https://library-2-x5uh.onrender.com`

Test login with:
- Email: `mulugeta.bekele@mwu.edu.et`
- Password: `password123`

---

## 🚨 Quick Fix for Current Deployment

Since your frontend is already deployed but misconfigured:

### In Render Dashboard:

1. Go to: https://dashboard.render.com
2. Select your service: `library-2-x5uh`
3. Go to "Settings"
4. Update:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Go to "Environment"
6. Add:
   - `NEXT_PUBLIC_API_URL` = `http://localhost:8000/api.php` (temporary, until backend is deployed)
7. Click "Manual Deploy" → "Deploy latest commit"

---

## 💡 Alternative: Deploy to Vercel (Easier for Next.js)

### Frontend on Vercel:
1. Go to: https://vercel.com
2. Import from GitHub: `gudinaadana/LIBRARY`
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variable**: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Backend Options:
- Keep on local server with ngrok for testing
- Deploy to Heroku (better PHP support)
- Deploy to Railway.app

---

## 📝 Summary

Your current deployment has these issues:
1. ❌ Building from root instead of `frontend/` folder
2. ❌ Backend (PHP/Laravel) not deployed
3. ❌ No database configured
4. ❌ Frontend can't connect to backend API

**Recommended Solution:**
1. Fix frontend: Set Root Directory to `frontend` in Render
2. Deploy backend: Use Heroku or Railway for PHP
3. Setup database: Use PlanetScale or Railway MySQL
4. Update frontend env: Point to deployed backend URL

---

## 🆘 Need Help?

Check these resources:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Heroku PHP: https://devcenter.heroku.com/articles/getting-started-with-php

---

**MWU DIGITAL LIBRARY**  
Madda Walabu University  
© 2024 All Rights Reserved
