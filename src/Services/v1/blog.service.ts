import logger from "@/lib/winston";
import { Blog } from "@/models/v1/blog";
import { CreateBlogDto, UpdateBlogDto } from "@/validations/dtos";
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
interface QueryType {
  status?: "draft" | "published" | { $in: ("draft" | "published")[] };
}
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
    throw new ResourceAlreadyExistsException(
      "Blog with this title already exists"
    );
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

interface BlogQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "viewsCount" | "likesCount";
  order?: "asc" | "desc";
}

export const getBlogByUserService = async (
  orgId: Types.ObjectId,
  userId: string,
  currentUserId: string,
  queryParams: BlogQueryParams = {}
) => {
  const query: QueryType = {};

  const [user, currentUser] = await Promise.all([
    User.findById(userId),
    User.findById(currentUserId),
  ]);

  if (!user) {
    logger.warn("User not found:", userId);
    throw new NotFoundException("User not found");
  }

  if (!currentUser) {
    logger.warn("Current user not found:", currentUserId);
    throw new NotFoundException("Current user not found");
  }

  if (currentUser._id.toString() === userId || currentUser.role === "admin") {
    query.status = { $in: ["draft", "published"] };
  } else if (currentUser.role === "user") {
    query.status = "published";
  } else {
    query.status = "published";
  }
  const page = Math.max(1, queryParams.page || 1);
  const limit = Math.min(50, queryParams.limit || 10);
  const skip = (page - 1) * limit;

  const sortOptions: { [key: string]: 1 | -1 } = {};
  if (queryParams.sortBy) {
    sortOptions[queryParams.sortBy] = queryParams.order === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  try {
    const [totalBlogs, blogs] = await Promise.all([
      Blog.countDocuments({
        orgId,
        author: userId,
        ...query,
      }),
      Blog.find({
        orgId,
        author: userId,
        ...query,
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("author", "username avatar")
        .select("-content"),
    ]);
    const totalPages = Math.ceil(totalBlogs / limit);

    logger.info(`Retrieved ${blogs.length} blogs for user: ${userId}`);

    return {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasMore: page < totalPages,
        limit,
      },
    };
  } catch (error) {
    logger.error("Error retrieving blogs:", error);
    throw error;
  }
};

export const getBlogBySlugService = async (
  orgId: Types.ObjectId,
  slug: string,
  userId: string
) => {
  const blog = await Blog.findOne({
    orgId,
    slug,
  });
  const user = await User.findById(userId);
  if (!blog) {
    logger.warn("Blog not found:", slug);
    throw new NotFoundException("Blog not found");
  }
  if (
    user?.role !== "admin" ||
    user?._id.toString() !== blog.author.toString()
  ) {
    if (blog.status === "draft") {
      logger.warn("Unauthorized access to draft blog:", slug);
      throw new UnauthorizedAccessException(
        "You do not have permission to view this blog"
      );
    }
  }
  blog.viewsCount += 1;
  await blog.save();
  return blog;
};

export const getAllBlogService = async (
  orgId: Types.ObjectId,
  userId: string,
  queryParams: BlogQueryParams = {}
) => {
  const query: QueryType = {};

  const user = await User.findById(userId);

  if (!user) {
    logger.warn("User not found:", userId);
    throw new NotFoundException("User not found");
  }

  if (user.role === "user") {
    query.status = "published";
  } else {
    query.status = { $in: ["draft", "published"] };
  }
  const page = Math.max(1, queryParams.page || 1);
  const limit = Math.min(50, queryParams.limit || 10);
  const skip = (page - 1) * limit;

  const sortOptions: { [key: string]: 1 | -1 } = {};
  if (queryParams.sortBy) {
    sortOptions[queryParams.sortBy] = queryParams.order === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  try {
    const [totalBlogs, blogs] = await Promise.all([
      Blog.countDocuments({
        orgId,
        ...query,
      }),
      Blog.find({
        orgId,
        ...query,
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("author", "username avatar")
        .select("-content"),
    ]);
    const totalPages = Math.ceil(totalBlogs / limit);

    logger.info(`Retrieved ${blogs.length} blogs for user: ${userId}`);

    return {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasMore: page < totalPages,
        limit,
      },
    };
  } catch (error) {
    logger.error("Error retrieving blogs:", error);
    throw error;
  }
};

export const updateBlogService = async (
  data: UpdateBlogDto,
  orgId: Types.ObjectId,
  userId: string,
  blogId: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    logger.warn("User not found:", userId);
    throw new NotFoundException("User not found");
  }

  const blog = await Blog.findOne({
    _id: blogId,
    orgId: orgId,
  });

  if (!blog) {
    logger.warn("Blog not found for update:", blogId);
    throw new NotFoundException("Blog not found");
  }

  if (user.role !== "admin" && user._id.toString() !== blog.author.toString()) {
    logger.warn("Unauthorized access to update blog:", userId);
    throw new UnauthorizedAccessException(
      "You do not have permission to update this blog"
    );
  }

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);

  const updateData: any = {};

  if (data.title && data.title !== blog.title) {
    const slugifiedTitle = slugify(data.title, {
      replacement: "-",
      trim: true,
      lower: true,
      strict: true,
    });

    const existingBlog = await Blog.findOne({
      slug: slugifiedTitle,
      orgId: orgId,
      _id: { $ne: blogId },
    });

    if (existingBlog) {
      logger.warn("Blog with this title already exists:", slugifiedTitle);
      throw new ResourceAlreadyExistsException(
        "Blog with this title already exists"
      );
    }
    updateData.title = data.title;
    updateData.slug = slugifiedTitle;
    logger.info("Updating blog title and slug:", slugifiedTitle);
  }
  if (data.content) {
    const cleanContent = purify.sanitize(data.content);
    updateData.content = cleanContent;
    logger.info("Updating blog content");
  }
  if (data.status) {
    updateData.status = data.status;
    logger.info("Updating blog status:", data.status);
  }
  if (data.banner) {
    updateData.banner = {
      publicId: data.banner.publicId,
      url: data.banner.url,
      width: data.banner.width,
      height: data.banner.height,
    };
    logger.info("Updating blog banner");
  }
  updateData.updatedAt = new Date();

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
      }
    ).populate("author", "username avatar");

    if (!updatedBlog) {
      logger.warn("Failed to update blog:", blogId);
      throw new NotFoundException("Blog not found");
    }

    logger.info("Blog updated successfully:", blogId);
    return updatedBlog;
  } catch (error) {
    logger.error("Error updating blog:", error);
    throw error;
  }
};


//TODO : FINISH THE UPDATE BLOG SERVICE.
