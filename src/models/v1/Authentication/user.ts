import bcrypt from "bcrypt";
import { model, Schema, Types } from "mongoose";

interface IUser {
  orgId?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "super_admin" | "org_admin" | "org_user";
  status: "active" | "inactive" | "banned";
  bio?: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      maxLength: [20, "Username must be less than 20 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      maxLength: [50, "Email must be less than 50 characters"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    firstName: {
      type: String,
      maxLength: [30, "First name must be less than 30 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      maxLength: [30, "Last name must be less than 30 characters"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "org_admin", "org_user"],
      default: "org_user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    bio: String,
    avatar: String,
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ organizationId: 1, username: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, status: 1 });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12); // Use 12 rounds
  next();
});

export const User = model<IUser>("User", UserSchema);
