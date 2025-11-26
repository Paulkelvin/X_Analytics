import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import XAccount from '../models/XAccount';
import FollowerSnapshot from '../models/FollowerSnapshot';
import FollowingSnapshot from '../models/FollowingSnapshot';
import InactivityScore from '../models/InactivityScore';

export const getNonFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sortBy = 'followers_desc' } = req.query;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Get latest following list
    const following = await FollowingSnapshot.find({
      xAccountId: xAccount._id,
      snapshotDate: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    }).lean();

    // Get latest followers list
    const followers = await FollowerSnapshot.find({
      xAccountId: xAccount._id,
      snapshotDate: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }).lean();

    const followerIds = new Set(followers.map((f: any) => f.followerXUserId));

    // Filter non-followers
    let nonFollowers = following.filter((f: any) => !followerIds.has(f.followingXUserId));

    // Apply sorting
    switch (sortBy) {
      case 'followers_desc':
        nonFollowers.sort((a: any, b: any) => (b.followingFollowersCount || 0) - (a.followingFollowersCount || 0));
        break;
      case 'followers_asc':
        nonFollowers.sort((a: any, b: any) => (a.followingFollowersCount || 0) - (b.followingFollowersCount || 0));
        break;
      case 'newest':
        nonFollowers.sort((a: any, b: any) => (b.followedAt?.getTime() || 0) - (a.followedAt?.getTime() || 0));
        break;
      case 'oldest':
        nonFollowers.sort((a: any, b: any) => (a.followedAt?.getTime() || 0) - (b.followedAt?.getTime() || 0));
        break;
    }

    // Format response
    const formattedNonFollowers = nonFollowers.map((user: any) => ({
      xUserId: user.followingXUserId,
      username: user.followingUsername,
      displayName: user.followingDisplayName,
      profileImageUrl: user.followingProfileImageUrl,
      bio: user.followingBio,
      followersCount: user.followingFollowersCount,
      followingCount: user.followingFollowingCount,
      location: user.followingLocation,
      verified: user.followingVerified,
      profileUrl: `https://x.com/${user.followingUsername}`,
    }));

    res.json({
      count: formattedNonFollowers.length,
      nonFollowers: formattedNonFollowers,
    });
  } catch (error) {
    console.error('Get non-followers error:', error);
    res.status(500).json({ error: 'Failed to fetch non-followers' });
  }
};

export const getInactiveFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { activityLevel } = req.query;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Build query
    const whereClause: any = { xAccountId: xAccount._id };
    if (activityLevel) {
      whereClause.activityStatus = activityLevel;
    }

    // Get inactive followers
    const inactiveFollowers = await InactivityScore.find(whereClause)
      .sort({ daysSinceLastTweet: -1 })
      .lean();

    res.json({
      count: inactiveFollowers.length,
      inactiveFollowers: inactiveFollowers.map((score: any) => ({
        xUserId: score.followerXUserId,
        activityStatus: score.activityStatus,
        lastTweetDate: score.lastTweetDate,
        daysSinceLastTweet: score.daysSinceLastTweet,
        tweetCount30Days: score.tweetCount30Days,
        tweetCount90Days: score.tweetCount90Days,
        calculatedAt: score.calculatedAt,
      })),
    });
  } catch (error) {
    console.error('Get inactive followers error:', error);
    res.status(500).json({ error: 'Failed to fetch inactive followers' });
  }
};

export const syncFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Import sync service
    const dataSyncService = (await import('../services/dataSync.service')).default;
    
    // Start sync in background (don't await to return immediately)
    dataSyncService.fullSync(xAccount._id.toString()).catch(error => {
      console.error('Background sync error:', error);
    });
    
    res.json({
      message: 'Sync initiated successfully',
      status: 'processing',
    });
  } catch (error) {
    console.error('Sync followers error:', error);
    res.status(500).json({ error: 'Failed to sync followers' });
  }
};
