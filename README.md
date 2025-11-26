# X Analytics Dashboard

A comprehensive Twitter/X analytics platform for tracking non-followers, inactive followers, demographics, engagement quality, and growth metrics.

## Features

### 1. Non-Followers Dashboard
- Display users you follow who don't follow back
- Profile information (username, image, bio, follower/following counts)
- Sorting options (largest accounts, newest follows, least active)
- Direct links to X profiles

### 2. Inactive Followers Detection
- Algorithm-based detection using last tweet date and posting frequency
- Classifications: Active (30 days), Semi-inactive (60-90 days), Inactive (120+ days)
- Export inactive follower lists

### 3. Follower Demographics
- Location breakdown (country/city from public profiles)
- Language distribution
- Activity levels (daily, weekly, monthly, dormant)
- Account type detection (personal, business, creator, bot-like)

### 4. Engagement Quality Analytics
- Follower scoring based on likes, retweets, replies
- Labels: High-value, Passive, Ghost followers
- Posting consistency tracking

### 5. Follower Growth Tracking
- Daily new followers and losses
- Net growth metrics
- 7-day and 30-day trend charts

### 6. Safe Unfollow Tool
- Manual confirmation required per unfollow
- Whitelist protection
- Rate limit enforcement
- Max unfollows per day restriction

### 7. User Safety Features
- Whitelist accounts to never unfollow
- Bot probability indicators
- Duplicate account detection
- Fake profile warnings

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **State Management**: React Context/Hooks

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + OAuth 2.0 (X API)
- **Cron Jobs**: node-cron for scheduled tasks

### Database Schema
- `Users` - User accounts and authentication
- `X_Accounts` - Connected X/Twitter accounts with tokens
- `Followers_Snapshots` - Historical follower data
- `Following_Snapshots` - Historical following data
- `Engagement_Stats` - Engagement metrics per user
- `Growth_Stats` - Daily growth tracking
- `Inactivity_Scores` - Inactivity classifications
- `Whitelisted_Accounts` - Protected accounts

## Quick Start

### Automated Setup (Recommended)

1. **Check your environment:**
```powershell
.\check-environment.ps1
```

2. **Start the application:**
```powershell
.\start.ps1
```

The script will automatically check for:
- PostgreSQL running
- Environment files configured
- Dependencies installed

### Manual Setup

See **SETUP_GUIDE.md** for detailed step-by-step instructions.

### Quick Commands

```bash
# Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Run both servers concurrently
npm run dev:all

# Or run separately
npm run dev:backend   # Backend on port 5000
npm run dev:frontend  # Frontend on port 3000
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- X API Developer Account (Basic tier recommended)

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE x_analytics;
```

2. The backend will automatically create tables on first run

### Configuration

1. **Backend:** Copy `backend/.env.example` to `backend/.env` and configure:
   - Database credentials
   - X API credentials
   - JWT secret

2. **Frontend:** Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

### First Time Setup

1. Start the backend and frontend (see Quick Commands above)
2. Visit http://localhost:3000
3. Register a new account
4. Connect your X account
5. Click "Sync Now" to fetch your data
6. Explore your analytics!

## Project Structure

```
X_PROJECT/
├── frontend/              # Next.js frontend application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   └── public/          # Static assets
├── backend/              # Express backend API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   └── dist/            # Compiled JavaScript
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/x/authorize` - Initiate X OAuth flow
- `GET /api/auth/x/callback` - X OAuth callback

### Analytics
- `GET /api/followers/non-followers` - Get non-followers list
- `GET /api/followers/inactive` - Get inactive followers
- `GET /api/analytics/demographics` - Get follower demographics
- `GET /api/analytics/engagement` - Get engagement stats
- `GET /api/analytics/growth` - Get growth metrics

### Actions
- `POST /api/actions/unfollow` - Unfollow user (with confirmation)
- `POST /api/whitelist/add` - Add to whitelist
- `DELETE /api/whitelist/:id` - Remove from whitelist

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/health` - System health metrics

## Multi-User Support

- Unlimited user signups
- Role-based access control (Admin, User)
- Isolated user sessions
- Admin dashboard for system monitoring

## Rate Limiting & Safety

- Respects X API rate limits
- Maximum unfollows per day enforced
- Manual confirmation required for all unfollow actions
- Whitelist protection prevents accidental unfollows
- No background automation

## Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway/Render)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy from main branch

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License

## Security & Privacy

- User data is encrypted and securely stored
- X API tokens are encrypted at rest
- No data is shared with third parties
- Users control all data operations
- Complies with X API terms of service

## Support

For issues or questions, please open a GitHub issue.
