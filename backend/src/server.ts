import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import followerRoutes from './routes/follower.routes';
import analyticsRoutes from './routes/analytics.routes';
import actionRoutes from './routes/action.routes';
import whitelistRoutes from './routes/whitelist.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins for now
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/whitelist', whitelistRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    await connectDatabase();
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await connectDB();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('❌ Unable to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
} else {
  // For Vercel serverless - connect on first request and validate env vars
  console.log('🌍 Vercel serverless environment detected');
  console.log('Environment check:');
  console.log('- JWT_SECRET:', !!process.env.JWT_SECRET);
  console.log('- MONGODB_URI:', !!process.env.MONGODB_URI);
  console.log('- X_API_CLIENT_ID:', !!process.env.X_API_CLIENT_ID);
  console.log('- X_API_CLIENT_SECRET:', !!process.env.X_API_CLIENT_SECRET);
  console.log('- X_API_CALLBACK_URL:', !!process.env.X_API_CALLBACK_URL);
  console.log('- FRONTEND_URL:', !!process.env.FRONTEND_URL);

  connectDB().catch((error) => {
    console.error('❌ Database connection failed in serverless:', error);
  });
}

// Export the app for serverless
module.exports = app;
export default app;
