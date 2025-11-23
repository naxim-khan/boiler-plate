import { Router } from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
} from '../controllers/user.controller';

const router = Router();

// CRUD routes
router.get('/', getAllUsersController); // Get all users
router.get('/:id', getUserByIdController); // Get user by ID
router.post('/', createUserController); // Create new user
router.put('/:id', updateUserController); // Update user by ID
router.delete('/:id', deleteUserController); // Delete user by ID

export default router;
