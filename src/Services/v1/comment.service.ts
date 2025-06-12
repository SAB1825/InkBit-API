import logger from "@/lib/winston";
import { Blog } from "@/models/v1/blog";
import { User } from "@/models/v1/user";
import { Comment } from "@/models/v1/comment";
import { 
  NotFoundException, 
  UnauthorizedAccessException,
} from "@/utils/app-error";
import { createCommentDto, updateCommentDto } from "@/validations/dtos";
import { Types } from "mongoose";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

interface CommentQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

// CREATE COMMENT
export const createCommentService = async (
  data: createCommentDto,
  orgId: Types.ObjectId,
  userId: string,
  blogId: string
) => {
  // Check if blog exists and is published
  const blog = await Blog.findOne({
    _id: blogId,
    orgId: orgId,
    status: "published" // Only allow comments on published blogs
  });

  if (!blog) {
    logger.warn("Blog not found or not published:", blogId);
    throw new NotFoundException("Blog not found or not available for comments");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    logger.warn("User not found:", userId);
    throw new NotFoundException("User not found");
  }

  // Sanitize comment content
  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  const cleanContent = purify.sanitize(data.content, { 
    ALLOWED_TAGS: [], // No HTML tags allowed in comments
    ALLOWED_ATTR: [] 
  });

  

  try {
    const newComment = new Comment({
      orgId: orgId,
      blogId: blogId,
      userId: userId,
      content: cleanContent.trim()
    });

    const savedComment = await newComment.save();

    // Increment blog comments count
    await Blog.findByIdAndUpdate(blogId, {
      $inc: { commentsCount: 1 }
    });

    // Populate user data for response
    const populatedComment = await Comment.findById(savedComment._id)
      .populate("userId", "username avatar")
      .populate("blogId", "title slug");

    logger.info("Comment created successfully:", savedComment._id);
    return populatedComment;
  } catch (error) {
    logger.error("Error creating comment:", error);
    throw error;
  }
};

// GET COMMENTS BY BLOG
export const getCommentsByBlogService = async (
  orgId: Types.ObjectId,
  blogId: string,
  queryParams: CommentQueryParams = {}
) => {
  // Check if blog exists
  const blog = await Blog.findOne({
    _id: blogId,
    orgId: orgId
  });

  if (!blog) {
    logger.warn("Blog not found:", blogId);
    throw new NotFoundException("Blog not found");
  }

  const page = Math.max(1, queryParams.page || 1);
  const limit = Math.min(50, queryParams.limit || 20);
  const skip = (page - 1) * limit;

  const sortOptions: { [key: string]: 1 | -1 } = {};
  if (queryParams.sortBy) {
    sortOptions[queryParams.sortBy] = queryParams.order === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Latest first
  }

  try {
    const [totalComments, comments] = await Promise.all([
      Comment.countDocuments({
        blogId: blogId,
        orgId: orgId,
        isDeleted: false
      }),
      Comment.find({
        blogId: blogId,
        orgId: orgId,
        isDeleted: false
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("userId", "username avatar")
        .lean()
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    logger.info(`Retrieved ${comments.length} comments for blog: ${blogId}`);

    return {
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasMore: page < totalPages,
        limit,
      },
    };
  } catch (error) {
    logger.error("Error retrieving comments:", error);
    throw error;
  }
};

// GET COMMENTS BY USER
export const getCommentsByUserService = async (
  orgId: Types.ObjectId,
  targetUserId: string,
  currentUserId: string,
  queryParams: CommentQueryParams = {}
) => {
  // Check if target user exists
  const user = await User.findById(targetUserId);
  if (!user) {
    logger.warn("User not found:", targetUserId);
    throw new NotFoundException("User not found");
  }

  const page = Math.max(1, queryParams.page || 1);
  const limit = Math.min(50, queryParams.limit || 20);
  const skip = (page - 1) * limit;

  const sortOptions: { [key: string]: 1 | -1 } = {};
  if (queryParams.sortBy) {
    sortOptions[queryParams.sortBy] = queryParams.order === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  try {
    const [totalComments, comments] = await Promise.all([
      Comment.countDocuments({
        userId: targetUserId,
        orgId: orgId,
        isDeleted: false
      }),
      Comment.find({
        userId: targetUserId,
        orgId: orgId,
        isDeleted: false
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("userId", "username avatar")
        .populate("blogId", "title slug")
        .lean()
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    logger.info(`Retrieved ${comments.length} comments for user: ${targetUserId}`);

    return {
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasMore: page < totalPages,
        limit,
      },
    };
  } catch (error) {
    logger.error("Error retrieving user comments:", error);
    throw error;
  }
};

// UPDATE COMMENT
export const updateCommentService = async (
  data: updateCommentDto,
  orgId: Types.ObjectId,
  userId: string,
  commentId: string
) => {
  const comment = await Comment.findOne({
    _id: commentId,
    orgId: orgId,
    isDeleted: false
  });

  if (!comment) {
    logger.warn("Comment not found:", commentId);
    throw new NotFoundException("Comment not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.warn("User not found:", userId);
    throw new NotFoundException("User not found");
  }

  if (user.role !== "admin" && comment.userId.toString() !== userId) {
    logger.warn("Unauthorized comment update attempt:", userId);
    throw new UnauthorizedAccessException(
      "You do not have permission to update this comment"
    );
  }

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  const cleanContent = purify.sanitize(data.content, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });


  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        content: cleanContent.trim(),
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    )
      .populate("userId", "username avatar")
      .populate("blogId", "title slug");

    logger.info("Comment updated successfully:", commentId);
    return updatedComment;
  } catch (error) {
    logger.error("Error updating comment:", error);
    throw error;
  }
};

export const deleteCommentService = async (
  orgId: Types.ObjectId,
  userId: string,
  commentId: string
) => {
  const comment = await Comment.findOne({
    _id: commentId,
    orgId: orgId,
    isDeleted: false
  });

  if (!comment) {
    logger.warn("Comment not found:", commentId);
    throw new NotFoundException("Comment not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.warn("User not found:", userId);
    throw new NotFoundException("User not found");
  }

  const blog = await Blog.findById(comment.blogId);
  const canDelete = 
    user.role === "admin" || 
    comment.userId.toString() === userId || 
    (blog && blog.author.toString() === userId);

  if (!canDelete) {
    logger.warn("Unauthorized comment deletion attempt:", userId);
    throw new UnauthorizedAccessException(
      "You do not have permission to delete this comment"
    );
  }

  try {
    // Soft delete
    await Comment.findByIdAndUpdate(commentId, {
      isDeleted: true,
      updatedAt: new Date()
    });

    // Decrement blog comments count
    await Blog.findByIdAndUpdate(comment.blogId, {
      $inc: { commentsCount: -1 }
    });

    logger.info("Comment deleted successfully:", commentId);
    return { message: "Comment deleted successfully" };
  } catch (error) {
    logger.error("Error deleting comment:", error);
    throw error;
  }
};