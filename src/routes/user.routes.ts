import { Router } from 'express';
import { uploadAvatar } from '../middlewares/upload.middleware';
import { uploadProfileImageController } from '../controllers/user.controller';
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
 * /api/users/profile/me/avatar:
 *   post:
 *     summary: Upload current user's profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/profile/me/avatar',
  uploadAvatar.single('avatar'), // multer middleware
  uploadProfileImageController
);

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
 * /api/users/profile/avatar:
 *   post:
 *     summary: Upload profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/profile/avatar', authenticate, uploadAvatar.single('avatar'), uploadProfileImageController);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination, sorting, and filtering (Admin/Moderator)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: Cursor (last user ID from previous page)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order of users
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email (partial matches allowed)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, MODERATOR, USER]
 *         description: Filter users by role
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created before this date (inclusive)
 *     responses:
 *       200:
 *         description: List of users with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *                   description: Cursor for next page (null if no more users)
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Internal server error
 *
 *     examples:
 *       Pagination:
 *         summary: Fetch first 10 users
 *         value: /api/users?limit=10
 *       Pagination + Cursor:
 *         summary: Fetch next page after user ID 20
 *         value: /api/users?limit=10&cursor=20
 *       Sorting:
 *         summary: Fetch users ascending or descending
 *         value: /api/users?orderBy=asc
 *       Filtering:
 *         summary: Search by name or role or date range
 *         value: /api/users?search=nazeem&role=USER&startDate=2025-01-01&endDate=2025-02-01
 *       Combined:
 *         summary: Fully combined query
 *         value: /api/users?limit=5&cursor=20&orderBy=desc&role=USER&search=ali
 *
 *     description: |
 *       Fully scalable endpoint with:
 *       - Cursor-based pagination
 *       - Sorting by asc/desc
 *       - Filtering by search, role, and date range
 *       - Supports large datasets efficiently
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