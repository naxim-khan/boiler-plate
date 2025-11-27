import * as Repositories from '../repositories';
import { hashPassword } from '../utils/password.util';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';

const { userRepository } = Repositories; 

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const getAllUsersService = async () => {
  return userRepository.getUsers();
};

export const getUserByIdService = async (id: number) => {
  return userRepository.getUserById(id);
};

export const getUserByEmailService = async (email: string) => {
  return userRepository.getUserByEmailPublic(email);
};

export const createUserService = async (data: CreateUserInput) => {
  try {
    // Hash password before creating user
    const hashedPassword = await hashPassword(data.password);
    
    const userData = {
      ...data,
      password: hashedPassword,
      role: data.role || 'USER'
    };
    
    return await userRepository.createUser(userData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create user', ERROR_CODES.INTERNAL);
  }
};

export const updateUserService = async (id: number, data: UpdateUserInput) => {
  try {
    // Hash password if provided
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    return await userRepository.updateUser(id, updateData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update user', ERROR_CODES.INTERNAL);
  }
};

export const deleteUserService = async (id: number) => {
  try {
    return await userRepository.deleteUser(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete user', ERROR_CODES.INTERNAL);
  }
};