import mongoose, { Document, Schema } from 'mongoose';

export interface IWhitelistedAccount extends Document {
  xAccountId: mongoose.Types.ObjectId;
  whitelistedXUserId: string;
  whitelistedUsername: string;
  whitelistedDisplayName: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const whitelistedAccountSchema = new Schema<IWhitelistedAccount>(
  {
    xAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'XAccount',
      required: true,
    },
    whitelistedXUserId: {
      type: String,
      required: true,
    },
    whitelistedUsername: {
      type: String,
      required: true,
    },
    whitelistedDisplayName: {
      type: String,
      required: true,
    },
    reason: String,
  },
  {
    timestamps: true,
  }
);

whitelistedAccountSchema.index({ xAccountId: 1, whitelistedXUserId: 1 }, { unique: true });

const WhitelistedAccount = mongoose.model<IWhitelistedAccount>('WhitelistedAccount', whitelistedAccountSchema);

export default WhitelistedAccount;
