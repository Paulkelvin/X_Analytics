
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import XAccount from '../models/XAccount';
import xApiService from '../services/xapi.service';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Initiate X (Twitter) OAuth using PKCE and a signed JWT "state" that contains the code_verifier.
export const initiateXAuth = async (req: AuthRequest, res: Response) => {
  try {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Optional: include user id if authenticated so callback can link account
    const userId = req.user?.id;

    // Create signed state token (expires in 10 minutes)
    const stateToken = jwt.sign(
      { codeVerifier, userId },
      jwtSecret,
      { expiresIn: '10m' }
    );

    // Generate authorization URL; pass codeVerifier so service can build deterministic code_challenge
    const authUrl = xApiService.generateAuthUrl(stateToken, codeVerifier);

    return res.json({ authUrl, message: 'Redirect user to this URL to authorize X account' });
  } catch (error) {
    console.error('Initiate X auth error:', error);
    return res.status(500).json({ error: 'Failed to initiate X authentication' });
  }
};

// Callback handler: verifies signed state, exchanges code for tokens using the embedded code_verifier,
// creates/updates User and XAccount records, then redirects to frontend with app JWT.
export const handleXCallback = async (req: AuthRequest, res: Response) => {
  try {
    console.log('X callback received:', { code: !!req.query.code, state: !!req.query.state });

    const { code, state } = req.query as { code?: string; state?: string };

    if (!code || !state) {
      console.error('Missing code or state:', { code: !!code, state: !!state });
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify signed state token
    let payload: any;
    try {
      payload = jwt.verify(state, jwtSecret);
    } catch (err) {
      console.error('Invalid or expired state token:', err);
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    const codeVerifier: string | undefined = payload.codeVerifier;
    const userIdFromState: string | undefined = payload.userId;

    if (!codeVerifier) {
      console.error('No code_verifier in state');
      return res.status(400).json({ error: 'Invalid state' });
    }

    // Exchange code for access token using the original code_verifier
    const tokenData = await xApiService.getAccessToken(code, codeVerifier);
    console.log('Token exchange successful');

    // Fetch X user profile
    const profile = await xApiService.getUserProfile(tokenData.access_token);
    console.log('Profile fetched:', { id: profile.id, username: profile.username });

    const tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 0) * 1000);

    // Find or create app user using xUserId
    let user = await User.findOne({ xUserId: profile.id });
    if (!user) {
      user = await User.create({
        email: `${profile.username.toLowerCase()}@x-analytics.app`,
        password: crypto.randomBytes(32).toString('hex'),
        username: profile.username,
        xUserId: profile.id,
        displayName: profile.name,
        profileImageUrl: profile.profile_image_url,
        role: 'user',
      });
      console.log('New user created:', user._id);
    }

    const newUserId = user._id.toString();
    const userObjectId = new mongoose.Types.ObjectId(newUserId);

    // Upsert XAccount
    let xAccount = await XAccount.findOne({ xUserId: profile.id });
    if (xAccount) {
      xAccount.xDisplayName = profile.name;
      xAccount.accessToken = tokenData.access_token;
      xAccount.refreshToken = tokenData.refresh_token;
      xAccount.tokenExpiresAt = tokenExpiresAt;
      xAccount.profileImageUrl = profile.profile_image_url;
      xAccount.followersCount = profile.public_metrics?.followers_count || 0;
      xAccount.followingCount = profile.public_metrics?.following_count || 0;
      await xAccount.save();
      console.log('X account updated');
    } else {
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
      console.log('X account created');
    }

    // Create application JWT for the user
    const appJwtSecret = process.env.JWT_SECRET;
    if (!appJwtSecret) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const appToken = jwt.sign({ id: newUserId, username: user.username }, appJwtSecret, { expiresIn: '7d' });

    // Redirect back to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${appToken}&connected=true`);
  } catch (error) {
    console.error('Handle X callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/dashboard?error=auth_failed`);
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

    return res.json({ message: 'X account disconnected successfully' });
  } catch (error) {
    console.error('Disconnect X account error:', error);
    return res.status(500).json({ error: 'Failed to disconnect X account' });
  }
};

export const getXAccountStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const xAccount = await XAccount.findOne({ userId });

    if (!xAccount) {
      return res.json({ connected: false });
    }

    return res.json({
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
    return res.status(500).json({ error: 'Failed to get X account status' });
  }
};
