import mongoose, { Document, Schema } from 'mongoose';

export interface IInactivityScore extends Document {
  xAccountId: mongoose.Types.ObjectId;
  followerXUserId: string;
  activityStatus: 'active' | 'semi_inactive' | 'inactive' | 'dormant';
  daysSinceLastTweet?: number;
  lastTweetDate?: Date;
  tweetCount30Days: number;
  tweetCount90Days: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inactivityScoreSchema = new Schema<IInactivityScore>(
  {
    xAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'XAccount',
      required: true,
    },
    followerXUserId: {
      type: String,
      required: true,
    },
    activityStatus: {
      type: String,
      enum: ['active', 'semi_inactive', 'inactive', 'dormant'],
      required: true,
    },
    daysSinceLastTweet: Number,
    lastTweetDate: Date,
    tweetCount30Days: {
      type: Number,
      default: 0,
    },
    tweetCount90Days: {
      type: Number,
      default: 0,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

inactivityScoreSchema.index({ xAccountId: 1, followerXUserId: 1 }, { unique: true });
inactivityScoreSchema.index({ activityStatus: 1 });

const InactivityScore = mongoose.model<IInactivityScore>('InactivityScore', inactivityScoreSchema);

export default InactivityScore;
