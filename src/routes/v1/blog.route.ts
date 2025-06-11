import { createBlogController } from "@/controllers/v1/blog.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";


const router = Router();


router.post("/create", CheckApiKeyMiddleware, AuthMiddleware, createBlogController);

export const blogRoutes = router;