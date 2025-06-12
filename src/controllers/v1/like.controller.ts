import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler";
import { createLikeService, removeLikeService } from "@/Services/v1/like.service";
import { Request, Response } from "express";

export const createLike = asyncHandler(
    async(req : Request, res: Response) => {
        const blogId = req.params.blogId;
        const userId = req.userId;
        const orgId = req.orgId;
        if (!blogId) {
            res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Blog ID is required to create a like"
            })
        }

        const blog = await createLikeService(blogId, userId!, orgId!);

        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Like created successfully",
            data: {
                blog
            }
        });
    }
)
export const removeLike = asyncHandler(
    async(req : Request, res: Response) => {
        const blogId = req.params.blogId;
        const userId = req.userId;
        const orgId = req.orgId;
        if (!blogId) {
            res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Blog ID is required to create a like"
            })
        }

        await removeLikeService(blogId, userId!, orgId!);

        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Like removed successfully",
        });
    }
)
