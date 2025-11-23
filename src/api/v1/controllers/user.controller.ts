import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { successResponse } from '../../../utils/response'; 

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsersService();
    return successResponse(res, "Users retrieved successfully", users);
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
    const { name, email } = req.body;
    const user = await userService.createUserService({ name, email });
    return successResponse(res, "User created successfully", user, 201);
  } catch (err) {
    next(err);
  }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;
    const updatedUser = await userService.updateUserService(id, { name, email });
    return successResponse(res, "User updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const deletedUser = await userService.deleteUserService(id);
    return successResponse(res, "User deleted successfully", deletedUser);
  } catch (err) {
    next(err);
  }
};
