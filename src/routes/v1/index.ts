import { Router } from "express";
import {organizationRoutes} from "./organization.route";
import { authRoutes } from "./auth.route";
import { blogRoutes } from "./blog.route";
import { commentRoutes } from "./comment.route";
import { likeRoutes } from "./likes.route";

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});


router.use("/organization", organizationRoutes);
router.use("/auth", authRoutes);
router.use("/blog", blogRoutes)
router.use("/", commentRoutes)
router.use("/", likeRoutes)


export default router;