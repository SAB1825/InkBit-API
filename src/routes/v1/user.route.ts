import { createUserController, loginController, refreshTokenController } from "@/controllers/v1/authentication.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";


const router = Router();

router.post("/register" , CheckApiKeyMiddleware, createUserController);
router.post("/login", CheckApiKeyMiddleware, loginController);
router.post("/refresh-token", AuthMiddleware, refreshTokenController)
export const userRoutes = router;