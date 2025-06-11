import {
  createUserController,
  loginController,
  logoutController,
  refreshTokenController,
} from "@/controllers/v1/auth.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";

const router = Router();

router.post("/register", CheckApiKeyMiddleware, createUserController);
router.post("/login", CheckApiKeyMiddleware, loginController);
router.post(
  "/refresh-token",
  CheckApiKeyMiddleware,
  AuthMiddleware,
  refreshTokenController
);
router.post("/logout", CheckApiKeyMiddleware, AuthMiddleware, logoutController);
export const authRoutes = router;
