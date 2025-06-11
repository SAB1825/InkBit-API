import logger from "@/lib/winston";
import { Blog } from "@/models/v1/blog";
import { CreateBlogDto } from "@/validations/dtos";
import { Types } from "mongoose";
import slugify from "slugify";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import {
  NotFoundException,
  ResourceAlreadyExistsException,
  UnauthorizedAccessException,
} from "@/utils/app-error";
import { User } from "@/models/v1/user";

export const createBlogService = async (
  data: CreateBlogDto,
  orgId: Types.ObjectId,
  userId: string
) => {
  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  const cleanContent = purify.sanitize(data.content);
  const slugifiedTitle = slugify(data.title, {
    replacement: "-",
    trim: true,
    lower: true,
    strict: true,
  });
  const existingBlog = await Blog.findOne({
    slug: slugifiedTitle,
    orgId: orgId,
  });
  if (existingBlog) {
    logger.warn("Blog with this title already exists:", slugifiedTitle);
    throw new ResourceAlreadyExistsException("Blog with this title already exists");
  }
  logger.info("Creating blog with slugified title:", slugifiedTitle);
  const newBlog = new Blog({
    orgId: orgId,
    title: data.title,
    slug: slugifiedTitle,
    content: cleanContent,
    author: userId,
    status: data.status || "draft",
    banner: {
      publicId: data.banner.publicId,
      url: data.banner.url,
      width: data.banner.width,
      height: data.banner.height,
    },
    viewsCount: 0,
    likesCount: 0,
    commentsCount: 0,
  });
  logger.info("Saving new blog to the database");
  const savedBlog = await newBlog.save();
  logger.info("Blog created successfully:", savedBlog);
  return savedBlog;
};

export const deleteBlogService = async (
  blogId: string,
  orgId: Types.ObjectId,
  userId: string
) => {
  const blog = await Blog.findOneAndDelete({
    _id: blogId,
    orgId: orgId,
  });
  if (!blog) {
    logger.warn("Blog not found for deletion:", blogId);
    throw new NotFoundException("Blog not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    logger.warn("User not found for deletion:", userId);
    throw new NotFoundException("User not found");
  }
  if (user?.role == "admin") {
    logger.info("Admin user deleting blog:", userId);
    await Blog.findByIdAndDelete(blogId);
    logger.info("Blog deleted successfully:", blogId);
    return;
  }
  if (userId !== blog.author.toString()) {
    logger.warn("User does not have permission to delete this blog:", userId);
    throw new UnauthorizedAccessException(
      "You do not have permission to delete this blog"
    );
  }
  logger.info("Blog deleted successfully:", blogId);
};
