import { createOrganization, getOrganization } from "@/controllers/v1/organization.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { Router } from "express";


const router = Router();

router.post("/", createOrganization);
router.get("/:id", CheckApiKeyMiddleware, getOrganization);

export default router;