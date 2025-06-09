import { createUserController } from "@/controllers/v1/authentication.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { Router } from "express";


const router = Router();

router.post("/register" , CheckApiKeyMiddleware, createUserController);

export const userRoutes = router;