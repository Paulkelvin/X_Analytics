import XAccount from '../models/XAccount';
import FollowerSnapshot from '../models/FollowerSnapshot';
import InactivityScore from '../models/InactivityScore';
import xApiService from './xapi.service';

export class InactivityService {
  async analyzeInactivity(xAccountId: string): Promise<void> {
    try {
      const xAccount = await XAccount.findById(xAccountId);
      if (!xAccount) {
        throw new Error('X account not found');
      }

      console.log(`Analyzing inactivity for @${xAccount.xUsername}`);

      // Get latest followers
      const followers = await FollowerSnapshot.find({
        xAccountId: xAccount._id,
      })
        .sort({ snapshotDate: -1 })
        .limit(1000); // Limit to recent 1000 for performance

      for (const follower of followers) {
        try {
          // Get follower's recent tweets
          const tweets = await xApiService.getUserTweets(
            (follower as any).followerXUserId,
            xAccount.accessToken
          );

          let activityStatus: 'active' | 'semi_inactive' | 'inactive' | 'dormant' = 'dormant';
          let daysSinceLastTweet: number | undefined;
          let lastTweetDate: Date | undefined;
          let tweetCount30Days = 0;
          let tweetCount90Days = 0;

          if (tweets && tweets.data && tweets.data.length > 0) {
            // Calculate tweet counts
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

            tweetCount30Days = tweets.data.filter((t: any) => 
              new Date(t.created_at) >= thirtyDaysAgo
            ).length;

            tweetCount90Days = tweets.data.filter((t: any) => 
              new Date(t.created_at) >= ninetyDaysAgo
            ).length;

            // Get last tweet date
            const lastTweet = tweets.data[0];
            lastTweetDate = new Date(lastTweet.created_at);
            daysSinceLastTweet = Math.floor(
              (now.getTime() - lastTweetDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Classify activity
            if (daysSinceLastTweet <= 30 && tweetCount30Days >= 5) {
              activityStatus = 'active';
            } else if (daysSinceLastTweet <= 60) {
              activityStatus = 'semi_inactive';
            } else if (daysSinceLastTweet <= 120) {
              activityStatus = 'inactive';
            } else {
              activityStatus = 'dormant';
            }
          }

          // Save inactivity score
          await InactivityScore.findOneAndUpdate(
            {
              xAccountId: xAccount._id,
              followerXUserId: (follower as any).followerXUserId,
            },
            {
              activityStatus,
              daysSinceLastTweet,
              lastTweetDate,
              tweetCount30Days,
              tweetCount90Days,
              calculatedAt: new Date(),
            },
            { upsert: true, new: true }
          );
        } catch (error) {
          console.error(`Error analyzing follower ${(follower as any).followerUsername}:`, error);
          // Continue with next follower
        }
      }

      console.log(`✓ Inactivity analysis completed`);
    } catch (error) {
      console.error('Analyze inactivity error:', error);
      throw error;
    }
  }

  async getInactivitySummary(xAccountId: string): Promise<any> {
    try {
      const scores = await InactivityScore.find({ xAccountId }).lean();

      return {
        active: scores.filter((s: any) => s.activityStatus === 'active').length,
        semiInactive: scores.filter((s: any) => s.activityStatus === 'semi_inactive').length,
        inactive: scores.filter((s: any) => s.activityStatus === 'inactive').length,
        dormant: scores.filter((s: any) => s.activityStatus === 'dormant').length,
        total: scores.length,
      };
    } catch (error) {
      console.error('Get inactivity summary error:', error);
      return {
        active: 0,
        semiInactive: 0,
        inactive: 0,
        dormant: 0,
        total: 0,
      };
    }
  }
}

export default new InactivityService();
