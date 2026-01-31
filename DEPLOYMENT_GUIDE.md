# Travira Deployment Guide

Complete guide to deploy the Travira Tourism Safety Platform to production.

## Architecture Overview

- **Frontend**: React app → Deploy to Vercel (FREE)
- **Backend**: Node.js/Express → Deploy to Render (FREE - 750hrs/month)
- **Database**: MongoDB Atlas (already cloud-hosted) ✅
- **AI Services**: Python FastAPI → Deploy to Render (FREE)
- **Blockchain**: Node.js service → Deploy to Render (optional)

---

## Prerequisites

1. GitHub account (to push code)
2. Accounts on deployment platforms:
   - [Vercel](https://vercel.com) (Frontend)
   - [Railway](https://railway.app) (Backend & AI Services)
   - Or [Render](https://render.com) (Alternative)

---

## Step 1: Prepare Code for Deployment

### 1.1 Update Environment Variables

**Backend `.env`** (already configured):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=production
AI_SAFETY_SCORE_URL=https://your-ai-safety-service.railway.app
AI_CASE_REPORT_URL=https://your-ai-report-service.railway.app
BLOCKCHAIN_SERVICE_URL=https://your-blockchain-service.railway.app
```

**Frontend** - Update `src/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.railway.app';
```

### 1.2 Add Production Build Scripts

Backend `package.json` should have:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

Frontend `package.json` already has:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "start": "react-scripts start"
  }
}
```

---

## Step 2: Deploy Backend (Render - FREE & Recommended)

### Option A: Render (FREE - 750 hours/month)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up
   - Click "New +" → "Web Service"
   - Connect GitHub → Select your repository
   - Configure:
     - **Name**: travira-backend
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**:
   - Scroll down to "Environment Variables"
   - Add all variables from `.env`:
     ```
     MONGODB_URI=mongodb+srv://.mongodb.net/travira
     JWT_SECRET=travira-production-secret-2024
     NODE_ENV=production
     PORT=10000
     ```

4. **Get Backend URL**:
   - Render assigns: `https://travira-backend.onrender.com`
   - Copy this URL for frontend configuration

**Note**: Free tier sleeps after 15 min of inactivity. First request takes ~30 seconds to wake up.

### Option B: Railway (Alternative - $5 credit/month)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `backend` folder
4. Add environment variables
5. Get URL: `https://your-backend.railway.app`

---

## Step 3: Deploy Frontend (Vercel - Recommended)

### Option A: Vercel (Easiest for React)

1. **Update API URL**:
   Create `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-backend.railway.app
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import Git Repository
   - Select your repo
   - Configure:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
   - Add environment variable: `REACT_APP_API_URL`

3. **Get Frontend URL**:
   - Vercel assigns: `https://travira.vercel.app`

### Option B: Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. New site from Git → Select repo
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `froender - FREE)

### AI Safety Score Service

1. **Create new Render Web Service**:
   - New + → Web Service
   - Connect GitHub → Select `AI_services/safety_score` folder
   - Configure:
     - **Name**: travira-ai-safety
     - **Root Directory**: `AI_services/safety_score`
     - **Environment**: Python
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

2. **Get URL**: `https://travira-ai-safety.onrender.com`

### AI Case Report Service

1. Repeat above steps for `AI_services/case_report`:
   - **Root Directory**: `AI_services/case_report`
   - **Name**: travira-ai-report

2. **Get URL**: `https://travira-ai-report.onrender.com`

3. **Update Backend Environment**:
   - Go to backend Render service → Environment
   - Add variables:
     ```
     AI_SAFETY_SCORE_URL=https://travira-ai-safety.onrender.com
     AI_CASE_REPORT_URL=https://travira-ai-report.onrender.com
   - Go to backend Railway project
   - Add variables:
     ```
     AI_SAFETY_SCORE_URL=https://ai-safety-score.railway.app
     AI_CASE_REPORT_URL=https://ai-case-report.railway.app
     ```ender Web Service for `Blockchain` folder
   - **Root Directory**: `Blockchain`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
2. Set environment variables:
   ```
   PRIVATE_KEY=your-wallet-private-key
   RPC_URL=https://rpc-amoy.polygon.technology
   PORT=10000
   ```
3. Get URL and update backend:
   ```
   BLOCKCHAIN_SERVICE_URL=https://travira-blockchain.onrender.com
   PRIVATE_KEY=your-wallet-private-key
   RPC_URL=https://rpc-amoy.polygon.technology
   ```
3. Get URL and update backend:
   ```
   BLOCKCHAIN_SERVICE_URL=https://blockchain.railway.app
   ```

---

## Step 6: Configure CORS (Backend)

Update `backend/index.js` to allow your frontend domain:

```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'https://travira.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

---

## Step 7: Test Deployment

1. **Visit Frontend URL**: `https://travira.vercel.app`
2. **Test Login**: Use demo credentials
   - Admin: `admin` / `admin123`
   - Officer: `officer1` / `officer123`
   - Tourist: `tourist1` / `tourist123`
3. **Check Features**:
   - ✅ Dashboard loads
   - ✅ Authentication works
   - ✅ API calls successful
   - ✅ AI services respond
   - ✅ Database connected

---ender (CLI)
```bash
cd backend
# Push to GitHub first, then use Render dashboard
# Or use Render Blueprint (render.yaml)
```

### Deploy Frontend to Vercel (CLI)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Alternative: One-Click Deploy
Create `render.yaml` in project root for one-click deployment (see below)frontend
npm install -g vercel
vercel login
vercel --prod
```

---ender)
```env
MONGODB_URI=mongodb+srv://memesyou709_db_user:hello123@piyush0707.ga5mpiv.mongodb.net/travira
JWT_SECRET=travira-super-secret-production-key-2024
PORT=10000
NODE_ENV=production
AI_SAFETY_SCORE_URL=https://travira-ai-safety.onrender.com
AI_CASE_REPORT_URL=https://travira-ai-report.onrender.com
BLOCKCHAIN_SERVICE_URL=https://travira-blockchain.onrender.com
NODE_ENV=production
AI_SAFETY_SCORE_URL=https://ai-safety.railway.app
AI_CASE_REPORT_URL=https://ai-report.railway.app
BLOCKCHAIN_SERVICE_URL=https://blockchain.railway.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://travira-backend.onrender.com
```

### AI Services (Render)
```env
# PORT is automatically set by Render
# No additional vars needed
```

---

## Cost Estimates

### Free Tier (Perfect for SIH Demo!)
- **Render**: 750 hours/month FREE (enough for 1 service 24/7)
- **Vercel**: Unlimited for personal projects - FREE
- **MongoDB Atlas**: 512MB FREE forever
- **Total**: **100% FREE!** ✅

**Note**: Render free tier sleeps after 15 min inactivity. Perfect for demos and development!

### Production Scale (If Needed Later)
- **Render**: $7/month per service (backend + 2 AI services = $21)
- **Vercel Pro**: $20/month (optional, for teams)
- **MongoDB Atlas**: Free → $9/month (M2 cluster)
- **Total**: ~$30-50/month for full production

---

## Troubleshooting

### Backend not connecting to MongoDB
- Check `MONGODB_URI` is correctly set
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`

### Frontend can't reach Backend
- Check `REACT_APP_API_URL` in Vercel environment variables
- Verify CORS is configured correctly in backend

### AI Services timeout
- Increase Railway timeout settings
- Check Python dependencies installed correctly

---

## Post-Deployment

1. **Monitor Services**:
   - Railway dashboard for logs
   - Vercel analytics for frontend
   - MongoDB Atlas monitoring

2. **Set up Custom Domain** (Optional):
   - Vercel: Add domain in settings
   - Railway: Add custom domain

3. **Enable HTTPS**:
   - Automatic on Vercel and Railway ✅

4. **Backup Database**:
   - MongoDB Atlas auto-backups enabled ✅

---

## Alternative: Docker Deployment

If you prefer Docker:

```bash
# Build and deploy all services
docker-compose up -d
```

See `docker-compose.yml` for configuration.

---

## Support

For deployment issues:
1. Check service logs on Railway/Vercel
2. Verify all environment variables
3. Test API endpoints individually
4. Review MongoDB Atlas network access

---

**Your project is ready to deploy! Follow the steps above for each service.** 🚀
