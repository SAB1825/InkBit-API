import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandlerAndValidation } from "@/middlewares/async-handler";
import { createBlogService } from "@/Services/v1/blog.service";
import { CreateBlogDto } from "@/validations/dtos";
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
)