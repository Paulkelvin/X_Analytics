import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import XAccount from '../models/XAccount';
import WhitelistedAccount from '../models/WhitelistedAccount';

export const getWhitelist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Get whitelist
    const whitelist = await WhitelistedAccount.find({ xAccountId: xAccount._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: whitelist.length,
      whitelist: whitelist.map((item: any) => ({
        id: item._id,
        xUserId: item.whitelistedXUserId,
        username: item.whitelistedUsername,
        displayName: item.whitelistedDisplayName,
        reason: item.reason,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get whitelist error:', error);
    res.status(500).json({ error: 'Failed to fetch whitelist' });
  }
};

export const addToWhitelist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { xUserId, username, displayName, reason } = req.body;

    // Validation
    if (!xUserId || !username || !displayName) {
      return res.status(400).json({ error: 'User information required' });
    }

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Check if already whitelisted
    const existing = await WhitelistedAccount.findOne({
      xAccountId: xAccount._id,
      whitelistedXUserId: xUserId,
    });

    if (existing) {
      return res.status(400).json({ error: 'User already whitelisted' });
    }

    // Add to whitelist
    const whitelisted = await WhitelistedAccount.create({
      xAccountId: xAccount._id,
      whitelistedXUserId: xUserId,
      whitelistedUsername: username,
      whitelistedDisplayName: displayName,
      reason: reason || undefined,
    });

    res.status(201).json({
      message: 'User added to whitelist',
      whitelisted: {
        id: whitelisted._id,
        xUserId: whitelisted.whitelistedXUserId,
        username: whitelisted.whitelistedUsername,
        displayName: whitelisted.whitelistedDisplayName,
        reason: whitelisted.reason,
      },
    });
  } catch (error) {
    console.error('Add to whitelist error:', error);
    res.status(500).json({ error: 'Failed to add to whitelist' });
  }
};

export const removeFromWhitelist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Find and delete
    const whitelisted = await WhitelistedAccount.findOne({
      _id: id,
      xAccountId: xAccount._id,
    });

    if (!whitelisted) {
      return res.status(404).json({ error: 'Whitelisted user not found' });
    }

    await WhitelistedAccount.deleteOne({ _id: whitelisted._id });

    res.json({
      message: 'User removed from whitelist',
    });
  } catch (error) {
    console.error('Remove from whitelist error:', error);
    res.status(500).json({ error: 'Failed to remove from whitelist' });
  }
};
