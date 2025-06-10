import { createOrganization, deleteOrganization, getOrganization, updateOrganization } from "@/controllers/v1/organization.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AdminMiddleware } from "@/middlewares/role";
import { Router } from "express";


const router = Router();

router.post("/", createOrganization);
router.get("/", CheckApiKeyMiddleware,  getOrganization);
router.put("/", CheckApiKeyMiddleware,AdminMiddleware, updateOrganization);
router.delete("/", CheckApiKeyMiddleware,AdminMiddleware, deleteOrganization)

export default router;