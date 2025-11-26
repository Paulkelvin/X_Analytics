import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import XAccount from '../models/XAccount';
import WhitelistedAccount from '../models/WhitelistedAccount';

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targetXUserId, targetUsername, confirmed } = req.body;

    // Validation
    if (!targetXUserId || !targetUsername) {
      return res.status(400).json({ error: 'Target user information required' });
    }

    if (!confirmed) {
      return res.status(400).json({ error: 'Confirmation required to unfollow' });
    }

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Check if user is whitelisted
    const whitelisted = await WhitelistedAccount.findOne({
      xAccountId: xAccount._id,
      whitelistedXUserId: targetXUserId,
    });

    if (whitelisted) {
      return res.status(403).json({ 
        error: 'Cannot unfollow whitelisted user',
        message: `${targetUsername} is on your whitelist`,
      });
    }

    // TODO: Check daily unfollow limit
    // TODO: Implement actual X API unfollow request

    res.json({
      message: 'Unfollow action completed',
      note: 'X API integration pending - implement with twitter-api-v2 package',
      target: {
        xUserId: targetXUserId,
        username: targetUsername,
      },
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};
