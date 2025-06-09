import { model, Schema, Types } from "mongoose";

interface IOrganization {
  orgName: string;
  orgSlug: string;
  orgDomain: string;
  ownerId: Types.ObjectId;
  plan: 'starter' | 'professional' | 'enterprise';
  limits: {
    users: number;
    posts: number;
    apiCallsPerMonth: number;
  };
  usage: {
    currentUsers: number;
    currentPosts: number;
    apiCallsThisMonth: number;
  };
  status: 'active' | 'suspended' | 'cancelled';
}

const OrganizationSchema = new Schema<IOrganization>({
  orgName: {
    type: String,
    required: [true, "Organization name is required"],
    maxLength: [50, "Organization name must be less than 50 characters"],
    trim: true
  },
  orgSlug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"]
  },
  orgDomain: {
    type: String,
    required: [true, "Organization domain is required"],
    match: [/^https?:\/\/.+/, "Must be a valid domain with http or https"]
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: 'starter'
  },
  limits: {
    users: { type: Number, default: 5 },
    posts: { type: Number, default: 100 },
    apiCallsPerMonth: { type: Number, default: 10000 }
  },
  usage: {
    currentUsers: { type: Number, default: 0 },
    currentPosts: { type: Number, default: 0 },
    apiCallsThisMonth: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

OrganizationSchema.index({ orgSlug: 1 }, { unique: true });
OrganizationSchema.index({ ownerId: 1 });

export const Organization = model<IOrganization>('Organization', OrganizationSchema);