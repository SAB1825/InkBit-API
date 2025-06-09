import { createUserController } from "@/controllers/v1/authentication.controller";
import { Router } from "express";


const router = Router();

router.post("/register" , createUserController);

export const userRoutes = router;