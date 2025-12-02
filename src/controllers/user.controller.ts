import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { successResponse } from '../utils/response';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';
import { buildUserFilters } from '../utils/userFilters';
import { uploadUserAvatarService } from '../services/user.service';
import redis from '../config/redis';
import { RedisKeys } from '../utils/redisKeys';

// export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const users = await userService.getAllUsersService();
//     return successResponse(res, "Users retrieved successfully", users);
//   } catch (err) {
//     next(err);
//   }
// };


export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    // Sorting
    let orderBy: Record<string, "asc" | "desc"> = { id: "asc" };
    if (req.query.orderBy) {
      const v = String(req.query.orderBy).toLowerCase();
      if (v === "asc" || v === "desc") {
        orderBy = { id: v };
      } else {
        return res.status(400).json({ message: "Invalid orderBy value, use 'asc' or 'desc'" });
      }
    }

    // Filtering
    const where = buildUserFilters(req.query);
    // Redis caching
    const cacheKey = RedisKeys.usersList(req.query);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const users = await userService.getUsersWithPaginationService(limit, cursor, orderBy, where);
    const response = { users };

    // Cache for 2 minutes
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 120);

    return successResponse(res, "Users retrieved successfully", response);
  } catch (err) {
    next(err);
  }
};

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUserByIdService(id);
    return successResponse(res, "User retrieved successfully", user);
  } catch (err) {
    next(err);
  }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await userService.createUserService({ name, email, password, role });
    return successResponse(res, "User created successfully", user, 201);
  } catch (err) {
    next(err);
  }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    // For non-admin users, remove role from update data to prevent privilege escalation
    const currentUser = (req as any).user;
    if (currentUser.role !== 'ADMIN' && data.role) {
      delete data.role;
    }

    const updatedUser = await userService.updateUserService(id, data);
    return successResponse(res, "User updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    // Prevent admin from deleting themselves (optional safety measure)
    const currentUser = (req as any).user;
    if (currentUser.role === 'ADMIN' && currentUser.userId === id) {
      throw new ApiError(400, 'Admins cannot delete their own account via this endpoint. Use profile deletion instead.', ERROR_CODES.INVALID_INPUT);
    }

    const deletedUser = await userService.deleteUserService(id);
    return successResponse(res, "User deleted successfully", deletedUser);
  } catch (err) {
    next(err);
  }
};

// Self-update controller for users to update their own profile
export const updateSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = req.body;

    // Remove role from self-update to prevent privilege escalation
    const { role, ...updateData } = data;

    const updatedUser = await userService.updateUserService(userId, updateData);
    return successResponse(res, "Profile updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};

// Get self controller
export const getSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const user = await userService.getUserByIdService(userId);
    return successResponse(res, "User profile retrieved successfully", user);
  } catch (err) {
    next(err);
  }
};

// Delete self controller
export const deleteSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const deletedUser = await userService.deleteUserService(userId);

    // Clear refresh token cookie on self-deletion
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return successResponse(res, "Your account has been deleted successfully", deletedUser);
  } catch (err) {
    next(err);
  }
};

// upload image controller
export const uploadProfileImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    if (!req.file) {
      throw new ApiError(400, "No file uploaded", ERROR_CODES.INVALID_INPUT);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await uploadUserAvatarService(userId, avatarUrl);

    return successResponse(res, "Profile image uploaded successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};
