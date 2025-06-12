import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandlerAndValidation } from "@/middlewares/async-handler";
import { createCommentService, deleteCommentService, getCommentsByBlogService, getCommentsByUserService, updateCommentService } from "@/Services/v1/comment.service";
import { createCommentDto, updateCommentDto } from "@/validations/dtos";
import { Response, Request } from "express";

// CREATE COMMENT
export const createComment = asyncHandlerAndValidation(
  createCommentDto,
  "body",
  async (req: Request, res: Response, data: createCommentDto) => {
    const orgId = req.orgId;
    const userId = req.userId;
    const blogId = req.params.blogId;

    if (!blogId) {
       res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Blog ID is required"
      });
    }

    const comment = await createCommentService(data, orgId!, userId!, blogId!);

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Comment created successfully",
      data: comment
    });
  }
);

// GET COMMENTS BY BLOG
export const getCommentsByBlog = async (req: Request, res: Response) => {
  const orgId = req.orgId;
  const blogId = req.params.blogId;
  const queryParams = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
    sortBy: req.query.sortBy as "createdAt" | "updatedAt",
    order: req.query.order as "asc" | "desc"
  };

  if (!blogId) {
     res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: "Blog ID is required"
    });
  }

  const result = await getCommentsByBlogService(orgId!, blogId, queryParams);

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Comments retrieved successfully",
    data: result
  });
};

// GET COMMENTS BY USER
export const getCommentsByUser = async (req: Request, res: Response) => {
  const orgId = req.orgId;
  const currentUserId = req.userId;
  const targetUserId = req.params.userId;
  const queryParams = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
    sortBy: req.query.sortBy as "createdAt" | "updatedAt",
    order: req.query.order as "asc" | "desc"
  };

  if (!targetUserId) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: "User ID is required"
    });
  }

  const result = await getCommentsByUserService(orgId!, targetUserId, currentUserId!, queryParams);

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "User comments retrieved successfully",
    data: result
  });
};

// UPDATE COMMENT
export const updateComment = asyncHandlerAndValidation(
  updateCommentDto,
  "body",
  async (req: Request, res: Response, data: updateCommentDto) => {
    const orgId = req.orgId;
    const userId = req.userId;
    const commentId = req.params.commentId;

    if (!commentId) {
       res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Comment ID is required"
      });
    }

    const comment = await updateCommentService(data, orgId!, userId!, commentId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Comment updated successfully",
      data: comment
    });
  }
);

// DELETE COMMENT
export const deleteComment = async (req: Request, res: Response) => {
  const orgId = req.orgId;
  const userId = req.userId;
  const commentId = req.params.commentId;

  if (!commentId) {
     res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: "Comment ID is required"
    });
  }

  const result = await deleteCommentService(orgId!, userId!, commentId!);

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message
  });
};