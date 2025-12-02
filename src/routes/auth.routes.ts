import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
  getMeController,
  changePasswordController,
} from '../controllers/auth.controllers';
import { validateRequest, validateRefreshToken } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validations/auth.validation';

import { rateLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication operations
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', rateLimiter(10, 300), validateRequest(registerSchema), registerController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Successful login
 */
router.post(
  '/login', 
  // rateLimiter(5, 60),
  validateRequest(loginSchema), 
  loginController
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post(
  '/refresh-token',
  rateLimiter(30, 300),
  validateRefreshToken,
  refreshTokenController
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out
 */
router.post('/logout', authenticate, logoutController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 */
router.get(
  '/me',
  rateLimiter(30, 300), 
  authenticate, 
  getMeController,
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post(
  '/change-password',
  rateLimiter(30, 300), 
  authenticate, 
  validateRequest(changePasswordSchema), 
  changePasswordController
);

export default router;