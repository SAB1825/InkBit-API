import logger from "@/lib/winston";
import { Blog } from "@/models/v1/blog";
import { CreateBlogDto } from "@/validations/dtos";
import { Types } from "mongoose";
import slugify from "slugify";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export const createBlogService = async (
  data: CreateBlogDto,
  orgId: Types.ObjectId,
  userId: string
) => {
  try {
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    const cleanContent = purify.sanitize(data.content);
    const slugifiedTitle = slugify(data.title, {
      replacement: "-",
      trim: true,
      lower: true,
      strict: true,
    });
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
  } catch (error) {
    logger.error("Error creating blog:", error);
    throw error;
  }
};
