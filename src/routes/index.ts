// Import all route modules
import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import avatarRoute from './avatar.routes'
const router=Router();
// All module routes here
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/profile/me", avatarRoute);
// we can use it like above for future use.

// Export routes as named exports
export default router;
