import { Router } from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  updateSelfController,
  getSelfController,
  deleteSelfController,
} from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { 
  authenticate, 
  requireAdmin, 
  requireModerator, 
  requireAdminOrOwner,
  canUpdateUser,
  canDeleteUser,
  preventSelfRoleChange,
  normalizeRole
} from '../middlewares/auth.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,
  updateSelfSchema,
} from '../validations/user.validation';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/profile/me', getSelfController);

/**
 * @swagger
 * /api/users/profile/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSelf'
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile/me', validateRequest(updateSelfSchema), updateSelfController);

/**
 * @swagger
 * /api/users/profile/me:
 *   delete:
 *     summary: Delete current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.delete('/profile/me', deleteSelfController);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', requireModerator, getAllUsersController);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', validateRequest(getUserByIdSchema), requireAdminOrOwner, getUserByIdController);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', normalizeRole, validateRequest(createUserSchema), requireAdmin, createUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', normalizeRole, validateRequest(updateUserSchema), canUpdateUser, preventSelfRoleChange, updateUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', validateRequest(deleteUserSchema), canDeleteUser, deleteUserController);

export default router;