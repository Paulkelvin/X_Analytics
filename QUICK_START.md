# Quick Start Guide

## Prerequisites Check

1. **Node.js 18+**: `node --version`
2. **PostgreSQL 14+**: `psql --version`
3. **X (Twitter) API credentials**: Get from [developer.twitter.com](https://developer.twitter.com/)

## Setup Steps

### 1. Configure PostgreSQL

Update `backend/.env` with your PostgreSQL password:
```env
DB_PASSWORD=your_actual_postgres_password
```

### 2. Create Database (Option A - Automatic)

Run the setup script:
```powershell
.\setup-database.ps1
```

### 2. Create Database (Option B - Manual)

```powershell
psql -U postgres
CREATE DATABASE x_analytics;
\q
```

### 3. Configure X API Credentials

Get your credentials from [Twitter Developer Portal](https://developer.twitter.com/):

1. Create a new project/app
2. Enable OAuth 2.0
3. Set callback URL: `http://localhost:5000/api/auth/x/callback`
4. Copy Client ID and Client Secret

Update `backend/.env`:
```env
X_API_CLIENT_ID=your_client_id
X_API_CLIENT_SECRET=your_client_secret
```

### 4. Start the Application

From the root directory:
```powershell
npm run dev:all
```

This starts:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## Test the Application

1. **Open browser**: Navigate to http://localhost:3000
2. **Register**: Create a new account
3. **Login**: Sign in with your credentials
4. **Connect X Account**: Click "Connect X Account" button
5. **Authorize**: Authorize the app with your X (Twitter) account
6. **Sync Data**: Click "Sync Followers" to fetch your data
7. **View Analytics**: Navigate through different tabs:
   - Non-Followers
   - Inactive Followers
   - Demographics (coming soon)
   - Engagement (coming soon)
   - Growth (coming soon)

## Troubleshooting

### Database Connection Failed
- Check if PostgreSQL is running: `Get-Service postgresql*`
- Verify password in `backend/.env`
- Ensure database exists: `psql -U postgres -c "\l"`

### X API Authorization Failed
- Verify credentials in `backend/.env`
- Check callback URL matches exactly
- Ensure app has read/write permissions

### Port Already in Use
- Backend (5000): Change PORT in `backend/.env`
- Frontend (3000): It will auto-increment to 3001

### TypeScript Errors
The build passed successfully. If you see red squiggles:
```powershell
# Restart VS Code TypeScript server
# Press: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### X Account
- GET `/api/auth/x/authorize` - Start X OAuth flow
- GET `/api/auth/x/callback` - OAuth callback
- GET `/api/auth/x/status` - Check X account status

### Followers
- POST `/api/followers/sync` - Sync followers/following
- GET `/api/followers/non-followers` - Get non-followers list
- GET `/api/followers/inactive` - Get inactive followers

### Analytics
- GET `/api/analytics/demographics` - Get demographic data
- GET `/api/analytics/engagement` - Get engagement stats
- GET `/api/analytics/growth` - Get growth metrics

### Actions
- POST `/api/actions/unfollow` - Unfollow user
- POST `/api/whitelist/add` - Add to whitelist
- DELETE `/api/whitelist/:xUserId` - Remove from whitelist
- GET `/api/whitelist` - Get whitelist

## Database Tables

The app automatically creates these tables on first run:
- `users` - App users
- `x_accounts` - Connected X accounts
- `follower_snapshots` - Follower history
- `following_snapshots` - Following history
- `inactivity_scores` - Follower activity tracking
- `engagement_stats` - Engagement metrics
- `growth_stats` - Growth over time
- `whitelisted_accounts` - Protected accounts

## Development

### Backend Only
```powershell
cd backend
npm run dev
```

### Frontend Only
```powershell
cd frontend
npm run dev
```

### Build for Production
```powershell
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=x_analytics
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret
X_API_CLIENT_ID=your_client_id
X_API_CLIENT_SECRET=your_client_secret
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Features Implemented

✅ User authentication (JWT)
✅ X (Twitter) OAuth 2.0 integration
✅ Non-followers detection
✅ Inactive followers tracking (30/60/90/120+ days)
✅ Safe unfollow with whitelist
✅ Multi-user support
✅ Admin/User roles
✅ Follower/Following sync
✅ Activity analysis

## Coming Soon

⏳ Demographics visualization
⏳ Engagement scoring charts
⏳ Growth tracking graphs
⏳ CSV/JSON export
⏳ Bulk actions
⏳ Email notifications
