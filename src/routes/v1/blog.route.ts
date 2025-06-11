import { createBlogController, deleteBlogController, getBlogByUserController } from "@/controllers/v1/blog.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";


const router = Router();


router.post("/create", CheckApiKeyMiddleware, AuthMiddleware, createBlogController);
router.delete("/delete/:blogId", CheckApiKeyMiddleware, AuthMiddleware, deleteBlogController);
router.get("/:userId", CheckApiKeyMiddleware, AuthMiddleware, getBlogByUserController);``
export const blogRoutes = router;