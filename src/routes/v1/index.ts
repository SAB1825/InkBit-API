import { Router } from "express";
import organizationRoutes from "./oraganization.route";
import { userRoutes } from "./user.route";

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
router.use("/auth", userRoutes)
export default router;