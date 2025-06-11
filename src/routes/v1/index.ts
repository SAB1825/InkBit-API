import { Router } from "express";
import {organizationRoutes} from "./oraganization.route";
import { authRoutes } from "./auth.route";
import { blogRoutes } from "./blog.route";

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});


router.use("/organization", organizationRoutes);
router.use("/auth", authRoutes);
router.use("/blog", blogRoutes)
export default router;