import XAccount from '../models/XAccount';
import FollowerSnapshot from '../models/FollowerSnapshot';
import FollowingSnapshot from '../models/FollowingSnapshot';
import GrowthStat from '../models/GrowthStat';
import xApiService from './xapi.service';

export class DataSyncService {
  // Sync followers for a specific X account
  async syncFollowers(xAccountId: string): Promise<void> {
    try {
      const xAccount = await XAccount.findById(xAccountId);
      if (!xAccount) {
        throw new Error('X account not found');
      }

      console.log(`Starting follower sync for @${xAccount.xUsername}`);

      let allFollowers: any[] = [];
      let paginationToken: string | undefined;

      // Fetch all followers with pagination
      do {
        const response = await xApiService.getFollowers(
          xAccount.xUserId,
          xAccount.accessToken,
          paginationToken
        );

        if (response.data) {
          allFollowers = allFollowers.concat(response.data);
        }

        paginationToken = response.meta?.next_token;
      } while (paginationToken);

      console.log(`Fetched ${allFollowers.length} followers`);

      // Save followers snapshot
      const snapshotDate = new Date();
      for (const follower of allFollowers) {
        await FollowerSnapshot.create({
          xAccountId: xAccount._id,
          followerXUserId: follower.id,
          followerUsername: follower.username,
          followerDisplayName: follower.name,
          followerProfileImageUrl: follower.profile_image_url,
          followerBio: follower.description,
          followerFollowersCount: follower.public_metrics?.followers_count,
          followerFollowingCount: follower.public_metrics?.following_count,
          followerLocation: follower.location,
          followerCreatedAt: follower.created_at ? new Date(follower.created_at) : undefined,
          followerVerified: follower.verified || false,
          snapshotDate,
        });
      }

      // Update account follower count
      xAccount.followersCount = allFollowers.length;
      xAccount.lastSyncedAt = new Date();
      await xAccount.save();

      console.log(`✓ Follower sync completed for @${xAccount.xUsername}`);
    } catch (error) {
      console.error('Sync followers error:', error);
      throw error;
    }
  }

  // Sync following for a specific X account
  async syncFollowing(xAccountId: string): Promise<void> {
    try {
      const xAccount = await XAccount.findById(xAccountId);
      if (!xAccount) {
        throw new Error('X account not found');
      }

      console.log(`Starting following sync for @${xAccount.xUsername}`);

      let allFollowing: any[] = [];
      let paginationToken: string | undefined;

      // Fetch all following with pagination
      do {
        const response = await xApiService.getFollowing(
          xAccount.xUserId,
          xAccount.accessToken,
          paginationToken
        );

        if (response.data) {
          allFollowing = allFollowing.concat(response.data);
        }

        paginationToken = response.meta?.next_token;
      } while (paginationToken);

      console.log(`Fetched ${allFollowing.length} following`);

      // Save following snapshot
      const snapshotDate = new Date();
      for (const following of allFollowing) {
        await FollowingSnapshot.create({
          xAccountId: xAccount._id,
          followingXUserId: following.id,
          followingUsername: following.username,
          followingDisplayName: following.name,
          followingProfileImageUrl: following.profile_image_url,
          followingBio: following.description,
          followingFollowersCount: following.public_metrics?.followers_count,
          followingFollowingCount: following.public_metrics?.following_count,
          followingLocation: following.location,
          followingCreatedAt: following.created_at ? new Date(following.created_at) : undefined,
          followingVerified: following.verified || false,
          snapshotDate,
        });
      }

      // Update account following count
      xAccount.followingCount = allFollowing.length;
      await xAccount.save();

      console.log(`✓ Following sync completed for @${xAccount.xUsername}`);
    } catch (error) {
      console.error('Sync following error:', error);
      throw error;
    }
  }

  // Full sync: followers + following + growth stats
  async fullSync(xAccountId: string): Promise<void> {
    try {
      console.log(`Starting full sync for account ID: ${xAccountId}`);

      await this.syncFollowers(xAccountId);
      await this.syncFollowing(xAccountId);
      await this.calculateGrowthStats(xAccountId);

      console.log('✓ Full sync completed successfully');
    } catch (error) {
      console.error('Full sync error:', error);
      throw error;
    }
  }

  // Calculate growth statistics
  async calculateGrowthStats(xAccountId: string): Promise<void> {
    try {
      const xAccount = await XAccount.findById(xAccountId);
      if (!xAccount) {
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get today's follower count
      const todayFollowers = await FollowerSnapshot.find({
        xAccountId: xAccount._id,
        snapshotDate: { $gte: today },
      });

      // Get yesterday's follower count
      const yesterdayFollowers = await FollowerSnapshot.find({
        xAccountId: xAccount._id,
        snapshotDate: { $gte: yesterday, $lt: today },
      });

      // Calculate changes
      const todayFollowerIds = new Set(todayFollowers.map((f: any) => f.followerXUserId));
      const yesterdayFollowerIds = new Set(yesterdayFollowers.map((f: any) => f.followerXUserId));

      // New followers: in today but not in yesterday
      const newFollowers = todayFollowers.filter((f: any) => !yesterdayFollowerIds.has(f.followerXUserId)).length;
      const lostFollowers = yesterdayFollowers.filter((f: any) => !todayFollowerIds.has(f.followerXUserId)).length;

      // Create or update growth stat
      await GrowthStat.findOneAndUpdate(
        {
          xAccountId: xAccount._id,
          date: today,
        },
        {
          followersCount: xAccount.followersCount,
          followingCount: xAccount.followingCount,
          followersGained: newFollowers,
          followersLost: lostFollowers,
          netFollowerChange: newFollowers - lostFollowers,
        },
        { upsert: true, new: true }
      );

      console.log(`✓ Growth stats calculated: +${newFollowers} -${lostFollowers}`);
    } catch (error) {
      console.error('Calculate growth stats error:', error);
    }
  }
}

export default new DataSyncService();
