import { HTTPSTATUS } from "@/config/http.config";
import {
  asyncHandler,
  asyncHandlerAndValidation,
} from "@/middlewares/async-handler";
import {
  createBlogService,
  deleteBlogService,
  getAllBlogService,
  getBlogBySlugService,
  getBlogByUserService,
  updateBlogService,
} from "@/Services/v1/blog.service";
import { CreateBlogDto, UpdateBlogDto } from "@/validations/dtos";
import { Request, Response } from "express";

export const createBlogController = asyncHandlerAndValidation(
  CreateBlogDto,
  "body",
  async (req: Request, res: Response, data) => {
    const orgId = req.orgId;
    const userId = req.userId;
    if (!userId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "User ID is required to create a blog",
      });
    }
    if (!orgId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Organization ID is required to create a blog",
      });
    }
    const blog = await createBlogService(data, orgId!, userId!);
    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Blog created successfully",
      data: {
        blog,
      },
    });
  }
);
export const deleteBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    const blogId = req.params.blogId;
    const orgId = req.orgId;
    const userId = req.userId;
    await deleteBlogService(blogId, orgId!, userId!);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Blog deleted successfully",
    });
  }
);
export const getBlogByUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const orgId = req.orgId;
    const userId = req.params.userId;
    const currentUserId = req.userId;

    // Extract and validate query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const sortBy = req.query.sortBy as
      | "createdAt"
      | "viewsCount"
      | "likesCount";
    const order = req.query.order as "asc" | "desc";

    if (!orgId || !userId || !currentUserId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const result = await getBlogByUserService(orgId, userId, currentUserId, {
      page,
      limit,
      sortBy,
      order,
    });

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Blogs retrieved successfully",
      data: result,
    });
  }
);
export const getBlogBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const orgId = req.orgId;

    const slug = req.params.slug;
    const userId = req.userId;
    if (!orgId || !userId || !slug) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Missing required parameters",
      });
    }
    const blog = await getBlogBySlugService(orgId!, slug, userId!);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog,
    });
  }
);

export const getAllBlogController = asyncHandler(
  async (req: Request, res: Response) => {
    const orgId = req.orgId;
    const userId = req.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const sortBy = req.query.sortBy as
      | "createdAt"
      | "viewsCount"
      | "likesCount";
    const order = req.query.order as "asc" | "desc";

    const blogs = await getAllBlogService(orgId!, userId!, {
      page,
      limit,
      sortBy,
      order,
    });

      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Blogs retrieved successfully",
        data: blogs,
      });
  }
);

export const updateBlogController = asyncHandlerAndValidation(
  UpdateBlogDto,
  "body",
  async (req: Request, res: Response, data) => {
    const orgId = req.orgId;
    const userId = req.userId;
    const blogId = req.params.blogId;

    if (!orgId || !userId || !blogId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const blog = await updateBlogService(data, orgId!, userId!, blogId!);
     res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  }
);
