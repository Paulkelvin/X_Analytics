import mongoose, { Document, Schema } from 'mongoose';

export interface IFollowingSnapshot extends Document {
  xAccountId: mongoose.Types.ObjectId;
  followingXUserId: string;
  followingUsername: string;
  followingDisplayName: string;
  followingProfileImageUrl?: string;
  followingBio?: string;
  followingFollowersCount?: number;
  followingFollowingCount?: number;
  followingLocation?: string;
  followingCreatedAt?: Date;
  followingVerified: boolean;
  followedAt?: Date;
  snapshotDate: Date;
  createdAt: Date;
}

const followingSnapshotSchema = new Schema<IFollowingSnapshot>(
  {
    xAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'XAccount',
      required: true,
    },
    followingXUserId: {
      type: String,
      required: true,
    },
    followingUsername: {
      type: String,
      required: true,
    },
    followingDisplayName: {
      type: String,
      required: true,
    },
    followingProfileImageUrl: String,
    followingBio: String,
    followingFollowersCount: Number,
    followingFollowingCount: Number,
    followingLocation: String,
    followingCreatedAt: Date,
    followingVerified: {
      type: Boolean,
      default: false,
    },
    followedAt: Date,
    snapshotDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

followingSnapshotSchema.index({ xAccountId: 1, followingXUserId: 1 });
followingSnapshotSchema.index({ snapshotDate: 1 });

const FollowingSnapshot = mongoose.model<IFollowingSnapshot>('FollowingSnapshot', followingSnapshotSchema);

export default FollowingSnapshot;
