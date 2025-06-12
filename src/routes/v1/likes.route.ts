import { createLike, removeLike } from "@/controllers/v1/like.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";

const route = Router();

route.post("/blog/:blogId/like", CheckApiKeyMiddleware, AuthMiddleware, createLike);
route.post("/blog/:blogId/unlike", CheckApiKeyMiddleware, AuthMiddleware, removeLike);

export const likeRoutes = route;