import { model, Schema, Types } from "mongoose";

interface IToken {
  token: string;
  userId: Types.ObjectId;

  type:
    | "email_verification"
    | "password_reset"
    | "api_session"
    | "refresh_token";
  expiresAt: Date;
  isActive: boolean;
}

const TokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "email_verification",
        "password_reset",
        "api_session",
        "refresh_token",
      ],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TokenSchema.index({ token: 1 }, { unique: true });
TokenSchema.index({ userId: 1, type: 1 });
TokenSchema.pre('find', async function() {
  const now = new Date();
  await Token.updateMany(
    { expiresAt: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );

});
export const Token = model<IToken>("Token", TokenSchema);
