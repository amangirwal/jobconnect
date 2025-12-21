# JobConnect Deployment Guide

This guide describes how to deploy the full-stack JobConnect application.

## Prerequisites
- GitHub Account (for source control)
- Accounts on hosting providers (Recommended: **Vercel** for frontend, **Render** or **Railway** for backend/database)

---

## 1. Database Deployment (MySQL)
You need a hosted MySQL database. **Railway** and **PlanetScale** are excellent free/cheap options.

### Option A: Railway (Recommended)
1.  Create a new project on [Railway.app](https://railway.app/).
2.  Add a **MySQL** database service.
3.  Copy the `DATABASE_URL` from the "Connect" tab. It will look like:
    `mysql://root:password@containers-us-west.railway.app:3306/railway`

---

## 2. Backend Deployment (Node.js)
We will deploy the backend to **Render** (or Railway).

### Preparation
1.  Ensure your `backend/package.json` has a `start` script: `"start": "node src/index.js"`.
2.  Push your code to a GitHub repository.

### Deploy on Render
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Settings:
    - **Root Directory**: `backend`
    - **Build Command**: `npm install && npx prisma generate`
    - **Start Command**: `npm start`
5.  **Environment Variables** (Add these):
    - `DATABASE_URL`: (Paste your connection string from Step 1)
    - `JWT_SECRET`: (Generate a secure random string)
    - `EMAIL_USER` / `EMAIL_PASS`: (Your email credentials)
    - `PORT`: `10000` (Render sets this automatically, but good to check)
6.  Click **Create Web Service**.
7.  Once deployed, copy your Backend URL (e.g., `https://jobconnect-api.onrender.com`).

---

## 3. Frontend Deployment (React + Vite)
We will deploy the frontend to **Vercel**.

### Preparation
1.  Update your frontend API configuration to point to the production backend.
    - Open `frontend/src/api/axios.js` (or wherever `baseURL` is defined).
    - It likely uses `import.meta.env.VITE_API_URL` or defaults to localhost.
    - Ensure it can read an environment variable.

### Deploy on Vercel
1.  Go to [Vercel Dashboard](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Settings:
    - **Framework Preset**: Vite
    - **Root Directory**: `frontend`
    - **Build Command**: `vite build` (Default)
    - **Output Directory**: `dist` (Default)
5.  **Environment Variables**:
    - `VITE_API_URL`: (Paste your Backend URL from Step 2, e.g., `https://jobconnect-api.onrender.com/api`)
6.  Click **Deploy**.

---

## 4. Final Verification
1.  Open your Vercel URL.
2.  Try signing up/logging in to verify Database and Backend connections.
3.  Check the Network tab in DevTools to ensure requests are going to your Backend URL, not `localhost`.
