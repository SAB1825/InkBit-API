import { createOrganization, getOrganization, updateOrganization } from "@/controllers/v1/organization.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { Router } from "express";


const router = Router();

router.post("/", createOrganization);
router.get("/", CheckApiKeyMiddleware, getOrganization);
router.put("/", CheckApiKeyMiddleware, updateOrganization);

export default router;