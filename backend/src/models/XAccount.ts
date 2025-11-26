import mongoose, { Document, Schema } from 'mongoose';

export interface IXAccount extends Document {
  userId: mongoose.Types.ObjectId;
  xUserId: string;
  xUsername: string;
  xDisplayName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  profileImageUrl?: string;
  followersCount: number;
  followingCount: number;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const xAccountSchema = new Schema<IXAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    xUserId: {
      type: String,
      required: true,
      unique: true,
    },
    xUsername: {
      type: String,
      required: true,
    },
    xDisplayName: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
    },
    profileImageUrl: {
      type: String,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

xAccountSchema.index({ userId: 1 });

const XAccount = mongoose.model<IXAccount>('XAccount', xAccountSchema);

export default XAccount;
