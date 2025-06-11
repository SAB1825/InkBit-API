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
interface QueryType {
  status?: 'draft' | 'published' | { $in: ('draft' | 'published')[] };
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

interface BlogQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'viewsCount' | 'likesCount';
  order?: 'asc' | 'desc';
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
    User.findById(currentUserId)
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
  }else if (currentUser.role === "user") {
    query.status = "published";
  } else {
    query.status = "published";
  }
  console.log(query.status)
  // Set up pagination
  const page = Math.max(1, queryParams.page || 1);
  const limit = Math.min(50, queryParams.limit || 10);
  const skip = (page - 1) * limit;

  // Set up sorting
  const sortOptions: { [key: string]: 1 | -1 } = {};
  if (queryParams.sortBy) {
    sortOptions[queryParams.sortBy] = queryParams.order === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort by newest
  }

  try {
    // Get total count and blogs in parallel
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
        .populate('author', 'username avatar')
        .select('-content')
    ]);
    console.log(blogs)
    const totalPages = Math.ceil(totalBlogs / limit);

    logger.info(`Retrieved ${blogs.length} blogs for user: ${userId}`);

    return {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasMore: page < totalPages,
        limit
      }
    };
  } catch (error) {
    logger.error("Error retrieving blogs:", error);
    throw error;
  }
};