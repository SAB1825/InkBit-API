import { model, Schema, Types } from "mongoose";

interface IApiKey {
  orgId: Types.ObjectId;
  keyId: string;
  key: string;
  type: "live" | "test";
  isActive: boolean;
  lastUsed?: Date;
  permissions: string[];
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    keyId: {
      type: String,
      required: true,
      unique: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      // DON'T hash this - store as plain text for comparison
    },
    type: {
      type: String,
      enum: ["live", "test"],
      default: "live",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: Date,
    permissions: [
      {
        type: String,
        enum: ["posts.read", "posts.write", "users.read", "users.write"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

ApiKeySchema.index({ key: 1 }, { unique: true });
ApiKeySchema.index({ orgId: 1, isActive: 1 });

export const ApiKey = model<IApiKey>("ApiKey", ApiKeySchema);
