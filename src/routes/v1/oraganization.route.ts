import { createOrganization } from "@/controllers/v1/organization.controller";
import { Router } from "express";


const router = Router();

router.post("/", createOrganization);


export default router;