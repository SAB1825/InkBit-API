import { createOrganization, getOrganization } from "@/controllers/v1/organization.controller";
import { Router } from "express";


const router = Router();

router.post("/", createOrganization);
router.get("/:id", getOrganization);

export default router;