import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import XAccount from '../models/XAccount';
import xApiService from '../services/xapi.service';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Temporary storage for OAuth state (use Redis in production)
const oauthStates = new Map<string, { userId?: string; codeVerifier: string; expiresAt: number }>();

export const initiateXAuth = async (req: AuthRequest, res: Response) => {
  try {
    // No user required - direct OAuth
    const userId = req.user?.id; // Optional, may be undefined

    // Generate state and code verifier
    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Store state with optional user ID and code verifier (expires in 10 minutes)
    oauthStates.set(state, {
      userId,
      codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Generate authorization URL
    const authUrl = xApiService.generateAuthUrl(state, codeVerifier);

    res.json({
      authUrl,
      message: 'Redirect user to this URL to authorize X account',
    });
  } catch (error) {
    console.error('Initiate X auth error:', error);
    res.status(500).json({ error: 'Failed to initiate X authentication' });
  }
};

export const handleXCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    // Verify state
    const storedState = oauthStates.get(state as string);
    if (!storedState) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    // Check expiration
    if (Date.now() > storedState.expiresAt) {
      oauthStates.delete(state as string);
      return res.status(400).json({ error: 'State expired' });
    }

    const { userId, codeVerifier } = storedState;

    // Exchange code for access token
    const tokenData = await xApiService.getAccessToken(code as string, codeVerifier);

    // Get user profile
    const profile = await xApiService.getUserProfile(tokenData.access_token);

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Find or create user based on X account
    let user = await User.findOne({ xUserId: profile.id });
    
    if (!user) {
      // Auto-create user from X profile
      user = await User.create({
        email: `${profile.username.toLowerCase()}@x-analytics.app`,
        password: crypto.randomBytes(32).toString('hex'), // Random password (won't be used)
        username: profile.username,
        xUserId: profile.id,
        displayName: profile.name,
        profileImageUrl: profile.profile_image_url,
        role: 'user',
      });
    }

    const newUserId = user._id.toString();
    const userObjectId = new mongoose.Types.ObjectId(newUserId);

    // Check if X account already exists
    let xAccount = await XAccount.findOne({ xUserId: profile.id });

    if (xAccount) {
      // Update existing account
      xAccount.userId = userObjectId;
      xAccount.xUsername = profile.username;
      xAccount.xDisplayName = profile.name;
      xAccount.accessToken = tokenData.access_token;
      xAccount.refreshToken = tokenData.refresh_token;
      xAccount.tokenExpiresAt = tokenExpiresAt;
      xAccount.profileImageUrl = profile.profile_image_url;
      xAccount.followersCount = profile.public_metrics?.followers_count || 0;
      xAccount.followingCount = profile.public_metrics?.following_count || 0;
      await xAccount.save();
    } else {
      // Create new X account
      xAccount = await XAccount.create({
        userId: userObjectId,
        xUserId: profile.id,
        xUsername: profile.username,
        xDisplayName: profile.name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
        profileImageUrl: profile.profile_image_url,
        followersCount: profile.public_metrics?.followers_count || 0,
        followingCount: profile.public_metrics?.following_count || 0,
      });
    }

    // Generate JWT token for the user
    const appToken = jwt.sign(
      { id: newUserId, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Clean up state
    oauthStates.delete(state as string);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${appToken}&connected=true`);
  } catch (error) {
    console.error('Handle X callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?error=auth_failed`);
  }
};

export const disconnectXAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    await XAccount.deleteOne({ _id: xAccount._id });

    res.json({
      message: 'X account disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect X account error:', error);
    res.status(500).json({ error: 'Failed to disconnect X account' });
  }
};

export const getXAccountStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const xAccount = await XAccount.findOne({ userId });

    if (!xAccount) {
      return res.json({
        connected: false,
      });
    }

    res.json({
      connected: true,
      account: {
        xUserId: xAccount.xUserId,
        username: xAccount.xUsername,
        displayName: xAccount.xDisplayName,
        profileImageUrl: xAccount.profileImageUrl,
        followersCount: xAccount.followersCount,
        followingCount: xAccount.followingCount,
        lastSyncedAt: xAccount.lastSyncedAt,
      },
    });
  } catch (error) {
    console.error('Get X account status error:', error);
    res.status(500).json({ error: 'Failed to get X account status' });
  }
};
