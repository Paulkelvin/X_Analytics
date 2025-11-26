// Helper utility to get X account from user ID with proper MongoDB syntax
import XAccount from '../models/XAccount';
import { Response } from 'express';

export async function getXAccountByUserId(userId: string, res: Response) {
  const xAccount = await XAccount.findOne({ userId });
  if (!xAccount) {
    res.status(404).json({ error: 'X account not connected' });
    return null;
  }
  return xAccount;
}
