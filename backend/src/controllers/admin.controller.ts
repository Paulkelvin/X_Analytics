import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import XAccount from '../models/XAccount';
import mongoose from '../config/database';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Get X accounts for these users
    const userIds = users.map(u => u._id);
    const xAccounts = await XAccount.find({ userId: { $in: userIds } })
      .select('userId xUsername xDisplayName followersCount followingCount lastSyncedAt')
      .lean();

    // Map X accounts to users
    const usersWithAccounts = users.map(user => ({
      ...user,
      xAccount: xAccounts.find(xa => xa.userId.toString() === user._id.toString()) || null,
    }));

    res.json({
      count: users.length,
      users: usersWithAccounts,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getSystemHealth = async (req: AuthRequest, res: Response) => {
  try {
    // Get database connection status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Get user count
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const xAccountCount = await XAccount.countDocuments();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        type: 'MongoDB',
      },
      statistics: {
        totalUsers: userCount,
        adminUsers: adminCount,
        regularUsers: userCount - adminCount,
        connectedXAccounts: xAccountCount,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Failed to fetch system health',
    });
  }
};
