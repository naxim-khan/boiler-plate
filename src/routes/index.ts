// Import all route modules
import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';

const router=Router();
// All module routes here
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
// we can use it like above for future use.

// Export routes as named exports
export default router;
