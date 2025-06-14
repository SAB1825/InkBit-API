import { createBlogController, deleteBlogController, getAllBlogController, getBlogBySlugController, getBlogByUserController, updateBlogController } from "@/controllers/v1/blog.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";


const router = Router();


router.post("/create", CheckApiKeyMiddleware, AuthMiddleware, createBlogController);
router.delete("/delete/:blogId", CheckApiKeyMiddleware, AuthMiddleware, deleteBlogController);
router.get("/user/:userId", CheckApiKeyMiddleware, AuthMiddleware, getBlogByUserController);
router.get("/:slug", CheckApiKeyMiddleware, AuthMiddleware, getBlogBySlugController);
router.get("/", CheckApiKeyMiddleware, AuthMiddleware, getAllBlogController);
router.put("/:blogId", CheckApiKeyMiddleware, AuthMiddleware, updateBlogController);
export const blogRoutes = router;