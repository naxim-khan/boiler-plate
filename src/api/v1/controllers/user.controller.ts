import type { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsersService();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = await userService.createUserService({ name, email });
  res.status(201).json(user);
};
