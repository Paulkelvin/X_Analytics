# Environment Variables for Vercel Deployment

## 🚀 Backend Environment Variables

Copy these to your backend deployment (Vercel/Railway/Render):

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://X_analytics:Sxlbfcjv3iwuRufr@cluster0.gxw5qsg.mongodb.net/x_analytics?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=GENERATE_NEW_SECURE_KEY_HERE
JWT_EXPIRES_IN=7d
X_API_CLIENT_ID=Abtts1thnK0P83pjJsNesyF8f
X_API_CLIENT_SECRET=Na37MGlEUaiRXsqE6kuNvtNKIDaDO6tBy3BvC8gLSCVnZzlKON
X_API_CALLBACK_URL=https://your-backend-url.vercel.app/api/auth/x/callback
FRONTEND_URL=https://your-frontend-url.vercel.app
MAX_UNFOLLOWS_PER_DAY=100
X_API_RATE_LIMIT_WINDOW=15
```

## 🎨 Frontend Environment Variables

Copy these to your frontend deployment (Vercel):

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

## 📋 Deployment Steps

### 1. Deploy Backend:
- Go to https://vercel.com/new
- Import: `Paulkelvin/X_Analytics`
- Root Directory: `backend`
- Add all backend environment variables above
- Deploy & copy backend URL

### 2. Update X API Settings:
- Go to https://developer.twitter.com/en/portal/dashboard
- Update Callback URI: `https://your-backend-url.vercel.app/api/auth/x/callback`
- Save

### 3. Deploy Frontend:
- Import same repo
- Root Directory: `frontend`
- Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app`
- Deploy

### 4. Update Backend:
- Update `FRONTEND_URL` in backend env vars
- Redeploy backend

## ⚠️ Generate Secure JWT_SECRET:

Run locally:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output as your JWT_SECRET in production!
