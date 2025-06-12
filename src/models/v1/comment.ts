
import { Schema, model, Types } from 'mongoose';

export interface IComment {
  orgId: Types.ObjectId;
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>({
  orgId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  blogId: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxLength: [1000, 'Content must be less than 1000 characters'],
    minLength: [1, 'Content cannot be empty']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance
commentSchema.index({ blogId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

export const Comment = model<IComment>('Comment', commentSchema);
