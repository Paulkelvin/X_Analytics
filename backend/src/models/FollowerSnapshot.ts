import mongoose, { Document, Schema } from 'mongoose';

export interface IFollowerSnapshot extends Document {
  xAccountId: mongoose.Types.ObjectId;
  followerXUserId: string;
  followerUsername: string;
  followerDisplayName: string;
  followerProfileImageUrl?: string;
  followerBio?: string;
  followerFollowersCount?: number;
  followerFollowingCount?: number;
  followerLocation?: string;
  followerCreatedAt?: Date;
  followerVerified: boolean;
  snapshotDate: Date;
  createdAt: Date;
}

const followerSnapshotSchema = new Schema<IFollowerSnapshot>(
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
    followerUsername: {
      type: String,
      required: true,
    },
    followerDisplayName: {
      type: String,
      required: true,
    },
    followerProfileImageUrl: String,
    followerBio: String,
    followerFollowersCount: Number,
    followerFollowingCount: Number,
    followerLocation: String,
    followerCreatedAt: Date,
    followerVerified: {
      type: Boolean,
      default: false,
    },
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

followerSnapshotSchema.index({ xAccountId: 1, followerXUserId: 1 });
followerSnapshotSchema.index({ snapshotDate: 1 });

const FollowerSnapshot = mongoose.model<IFollowerSnapshot>('FollowerSnapshot', followerSnapshotSchema);

export default FollowerSnapshot;
