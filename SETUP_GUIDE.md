# X Analytics Dashboard - Setup Guide

## 🚀 Quick Start Guide

This guide will help you set up and run the X Analytics Dashboard on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)
- **X (Twitter) Developer Account** - [Apply here](https://developer.twitter.com/)

## Step 1: X API Setup

### 1.1 Create X Developer App

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create Project" and follow the prompts
3. Create a new App within your project
4. Note down your **Client ID** and **Client Secret**

### 1.2 Configure OAuth 2.0 Settings

1. In your app settings, go to "User authentication settings"
2. Enable **OAuth 2.0**
3. Set **Type of App**: Web App
4. Add **Callback URL**: `http://localhost:5000/api/auth/x/callback`
5. Add **Website URL**: `http://localhost:3000`
6. Set **Permissions**: Read + Write
7. Save your settings

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database

Open PostgreSQL terminal or pgAdmin and run:

```sql
CREATE DATABASE x_analytics;
```

### 2.2 Note Database Credentials

You'll need:
- Database host (usually `localhost`)
- Database port (usually `5432`)
- Database name (`x_analytics`)
- Database username (usually `postgres`)
- Database password

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Create Environment File

Copy the example environment file:

```bash
copy .env.example .env
```

### 3.4 Configure Environment Variables

Edit `.env` file with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=x_analytics
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d

# X (Twitter) API Credentials
X_API_CLIENT_ID=your_client_id_from_x_developer_portal
X_API_CLIENT_SECRET=your_client_secret_from_x_developer_portal
X_API_CALLBACK_URL=http://localhost:5000/api/auth/x/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
MAX_UNFOLLOWS_PER_DAY=100
X_API_RATE_LIMIT_WINDOW=15
```

### 3.5 Start Backend Server

```bash
npm run dev
```

The backend should start on `http://localhost:5000`

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server is running on port 5000
🌍 Environment: development
```

## Step 4: Frontend Setup

### 4.1 Open New Terminal and Navigate to Frontend

```bash
cd frontend
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Verify Environment File

Check that `.env.local` exists with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4.4 Start Frontend Server

```bash
npm run dev
```

The frontend should start on `http://localhost:3000`

## Step 5: Test the Application

### 5.1 Access the Application

Open your browser and go to: `http://localhost:3000`

### 5.2 Create Account

1. Click "Get Started" or "Sign Up"
2. Fill in your details:
   - Username
   - Email
   - Password
3. Click "Create Account"

### 5.3 Connect X Account

1. After registration, you'll be redirected to the dashboard
2. Click "Connect X Account"
3. You'll be redirected to X for authorization
4. Click "Authorize app"
5. You'll be redirected back to the dashboard

### 5.4 Sync Your Data

1. Once connected, click "Sync Now"
2. Wait for the sync to complete (may take a few minutes depending on follower count)
3. Navigate to "Non-Followers" tab to view results

## Troubleshooting

### Database Connection Failed

**Error:** `Unable to connect to the database`

**Solutions:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `x_analytics` exists
- Check if port 5432 is accessible

### X OAuth Error

**Error:** `auth_failed` in URL or authorization fails

**Solutions:**
- Verify Client ID and Client Secret are correct
- Check callback URL matches exactly: `http://localhost:5000/api/auth/x/callback`
- Ensure OAuth 2.0 is enabled in X Developer Portal
- Verify app has Read + Write permissions

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solutions:**
- Stop other processes using port 5000
- Or change PORT in backend `.env` file
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local` accordingly

### CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Restart backend server after changing environment variables

### Sync Taking Too Long

**Note:** Syncing depends on follower count and X API rate limits

**Expected Times:**
- < 1,000 followers: 1-2 minutes
- 1,000-5,000 followers: 3-10 minutes
- 5,000+ followers: 10-30+ minutes

## API Rate Limits

### X API Free Tier Limits

- 1,500 tweets per month
- Rate limits on follower/following requests

### X API Basic Tier ($100/month)

- 10,000 tweets per month
- Higher rate limits
- Better for accounts with many followers

## Production Deployment

### Backend (Railway/Render)

1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables in platform dashboard
4. Deploy from main branch

### Frontend (Vercel)

1. Create account on Vercel
2. Import GitHub repository
3. Set environment variable: `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy

### Database (Production)

Options:
- **Supabase** - Managed PostgreSQL (free tier available)
- **Railway** - PostgreSQL add-on
- **AWS RDS** - PostgreSQL managed service

## Features Overview

### ✅ Implemented Features

1. **User Authentication**
   - Registration and login with JWT
   - Role-based access (admin/user)
   - Secure password hashing

2. **X Account Integration**
   - OAuth 2.0 authentication
   - Token refresh mechanism
   - Account connection/disconnection

3. **Data Synchronization**
   - Follower list fetching
   - Following list fetching
   - Snapshot storage for historical tracking

4. **Non-Followers Detection**
   - Identify users you follow who don't follow back
   - Sorting options (largest accounts, newest follows)
   - Profile information display

5. **Inactivity Detection**
   - Algorithm-based activity analysis
   - Classification: Active, Semi-inactive, Inactive, Dormant
   - Based on tweet history and frequency

6. **Analytics Dashboard**
   - Demographics breakdown
   - Engagement quality scoring
   - Growth tracking with charts

7. **Safety Features**
   - Whitelist protection
   - Manual unfollow confirmation
   - Rate limit enforcement

### 🔄 Pending Integrations

- **Chart.js** for growth visualization
- **Export functionality** for CSV/JSON downloads
- **Admin panel** UI
- **Real-time notifications**
- **Scheduled background syncs**

## Support

For issues or questions:
1. Check this setup guide
2. Review error messages carefully
3. Check X Developer documentation
4. Open GitHub issue

## Security Notes

- Never commit `.env` files
- Keep API credentials secure
- Use strong JWT secret (32+ characters)
- Enable HTTPS in production
- Regularly rotate API keys

## Next Steps

1. ✅ Complete initial setup
2. ✅ Connect X account
3. ✅ Sync your data
4. Explore non-followers list
5. Analyze inactive followers
6. Review engagement analytics
7. Track growth over time
8. Set up whitelist
9. (Optional) Deploy to production

Enjoy using X Analytics Dashboard! 🎉
