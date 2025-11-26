import mongoose, { Document, Schema } from 'mongoose';

export interface IGrowthStat extends Document {
  xAccountId: mongoose.Types.ObjectId;
  date: Date;
  followersCount: number;
  followingCount: number;
  followersGained: number;
  followersLost: number;
  followingGained: number;
  followingLost: number;
  netFollowerChange: number;
  createdAt: Date;
}

const growthStatSchema = new Schema<IGrowthStat>(
  {
    xAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'XAccount',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    followersCount: {
      type: Number,
      required: true,
      default: 0,
    },
    followingCount: {
      type: Number,
      required: true,
      default: 0,
    },
    followersGained: {
      type: Number,
      default: 0,
    },
    followersLost: {
      type: Number,
      default: 0,
    },
    followingGained: {
      type: Number,
      default: 0,
    },
    followingLost: {
      type: Number,
      default: 0,
    },
    netFollowerChange: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

growthStatSchema.index({ xAccountId: 1, date: 1 }, { unique: true });

const GrowthStat = mongoose.model<IGrowthStat>('GrowthStat', growthStatSchema);

export default GrowthStat;
