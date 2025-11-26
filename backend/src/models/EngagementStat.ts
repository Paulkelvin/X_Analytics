import mongoose, { Document, Schema } from 'mongoose';

export interface IEngagementStat extends Document {
  xAccountId: mongoose.Types.ObjectId;
  followerXUserId: string;
  engagementScore: number;
  engagementTier: 'high_value' | 'engaged' | 'passive' | 'ghost';
  likesReceived: number;
  retweetsReceived: number;
  repliesReceived: number;
  mentionsCount: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const engagementStatSchema = new Schema<IEngagementStat>(
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
    engagementScore: {
      type: Number,
      required: true,
      default: 0,
    },
    engagementTier: {
      type: String,
      enum: ['high_value', 'engaged', 'passive', 'ghost'],
      required: true,
    },
    likesReceived: {
      type: Number,
      default: 0,
    },
    retweetsReceived: {
      type: Number,
      default: 0,
    },
    repliesReceived: {
      type: Number,
      default: 0,
    },
    mentionsCount: {
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

engagementStatSchema.index({ xAccountId: 1, followerXUserId: 1 }, { unique: true });
engagementStatSchema.index({ engagementTier: 1 });

const EngagementStat = mongoose.model<IEngagementStat>('EngagementStat', engagementStatSchema);

export default EngagementStat;
