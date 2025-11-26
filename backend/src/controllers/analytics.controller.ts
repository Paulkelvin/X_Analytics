import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import XAccount from '../models/XAccount';
import FollowerSnapshot from '../models/FollowerSnapshot';
import EngagementStat from '../models/EngagementStat';
import GrowthStat from '../models/GrowthStat';

export const getDemographics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Get latest followers
    const followers = await FollowerSnapshot.find({
      xAccountId: xAccount._id,
      snapshotDate: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }).lean();

    // Calculate demographics
    const locationCounts: { [key: string]: number } = {};
    const verifiedCount = followers.filter((f: any) => f.followerVerified).length;

    followers.forEach((follower: any) => {
      if (follower.followerLocation) {
        locationCounts[follower.followerLocation] = (locationCounts[follower.followerLocation] || 0) + 1;
      }
    });

    // Sort locations by count
    const topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }));

    res.json({
      totalFollowers: followers.length,
      verifiedFollowers: verifiedCount,
      topLocations,
      demographics: {
        verified: verifiedCount,
        unverified: followers.length - verifiedCount,
      },
    });
  } catch (error) {
    console.error('Get demographics error:', error);
    res.status(500).json({ error: 'Failed to fetch demographics' });
  }
};

export const getEngagementStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { tier } = req.query;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Build query
    const whereClause: any = { xAccountId: xAccount._id };
    if (tier) {
      whereClause.engagementTier = tier;
    }

    // Get engagement stats
    const stats = await EngagementStat.find(whereClause).lean();

    // Calculate summary
    const summary = {
      highValue: stats.filter((s: any) => s.engagementTier === 'high_value').length,
      engaged: stats.filter((s: any) => s.engagementTier === 'engaged').length,
      passive: stats.filter((s: any) => s.engagementTier === 'passive').length,
      ghost: stats.filter((s: any) => s.engagementTier === 'ghost').length,
      total: stats.length,
    };

    res.json({
      summary,
      stats: stats.map((stat: any) => ({
        xUserId: stat.followerXUserId,
        engagementScore: stat.engagementScore,
        engagementTier: stat.engagementTier,
        likesReceived: stat.likesReceived,
        retweetsReceived: stat.retweetsReceived,
        repliesReceived: stat.repliesReceived,
        mentionsCount: stat.mentionsCount,
        calculatedAt: stat.calculatedAt,
      })),
    });
  } catch (error) {
    console.error('Get engagement stats error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement stats' });
  }
};

export const getGrowthStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { days = 30 } = req.query;

    // Get user's X account
    const xAccount = await XAccount.findOne({ userId });
    if (!xAccount) {
      return res.status(404).json({ error: 'X account not connected' });
    }

    // Get growth stats for specified period
    const daysCount = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const growthStats = await GrowthStat.find({
      xAccountId: xAccount._id,
      date: {
        $gte: startDate,
      },
    }).sort({ date: 1 }).lean();

    // Calculate totals
    const totals = growthStats.reduce(
      (acc: any, stat: any) => ({
        followersGained: acc.followersGained + stat.followersGained,
        followersLost: acc.followersLost + stat.followersLost,
        netFollowerChange: acc.netFollowerChange + stat.netFollowerChange,
      }),
      { followersGained: 0, followersLost: 0, netFollowerChange: 0 }
    );

    res.json({
      period: `${daysCount} days`,
      totals,
      dailyStats: growthStats.map((stat: any) => ({
        date: stat.date,
        followersCount: stat.followersCount,
        followingCount: stat.followingCount,
        followersGained: stat.followersGained,
        followersLost: stat.followersLost,
        netFollowerChange: stat.netFollowerChange,
      })),
    });
  } catch (error) {
    console.error('Get growth stats error:', error);
    res.status(500).json({ error: 'Failed to fetch growth stats' });
  }
};
