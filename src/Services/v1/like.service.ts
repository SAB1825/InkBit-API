import logger from "@/lib/winston";
import { Blog } from "@/models/v1/blog";
import { Like } from "@/models/v1/likes";
import {
  NotFoundException,
  ResourceAlreadyExistsException,
} from "@/utils/app-error";
import { Types } from "mongoose";

export const createLikeService = async (
  blogId: string,
  userId: string,
  orgId: Types.ObjectId
) => {
  const blog = await Blog.findOne({
    _id: blogId,
    orgId: orgId,
  });
  if (!blog) {
    logger.warn("Blog not found:", blogId);
    throw new NotFoundException("Blog not found or not available for liking");
  }
  const existingLike = await Like.findOne({ blogId, userId }).lean().exec();
  if (existingLike) {
    logger.warn("Like already exists for this blog:", blogId);
    throw new ResourceAlreadyExistsException("Already Like the Blog");
  }
  const newLike = new Like({
    orgId: orgId,
    blogId: blogId,
    userId: userId,
  });
  await newLike.save();
  blog.likesCount += 1;
  await blog.save();

  return blog;
};

export const removeLikeService = async (
  blogId: string,
  userId: string,
  orgId: Types.ObjectId
) => {
  const blog = await Blog.findOne({
    _id: blogId,
    orgId: orgId,
  });
  if (!blog) {
    logger.warn("Blog not found:", blogId);
    throw new NotFoundException("Blog not found or not available for liking");
  }
  const existingLike = await Like.findOne({ blogId, userId }).lean().exec();
  if (!existingLike) {
    logger.warn("Like not found for this blog:", blogId);
    throw new NotFoundException("Like not found or not available.");
  }

  blog.likesCount = Math.max(0, blog.likesCount - 1);
  await blog.save();
  await Like.findByIdAndDelete(existingLike._id);
};
