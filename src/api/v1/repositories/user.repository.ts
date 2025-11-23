import prisma from '../../../PrismaClient';
import { ApiError } from '../../../common/errors/api-error';
import { ERROR_CODES } from '../../../common/errors/error-codes';
import type { CreateUserInput } from '../services/user.service';

export const getUsers = async () => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err: any) {
    throw new ApiError(500, 'Error fetching users', ERROR_CODES.INTERNAL, err.message);
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    return user;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `Error fetching user with ID ${id}`, ERROR_CODES.INTERNAL, err.message);
  }
};

export const createUser = async (data: CreateUserInput) => {
  try {
    return await prisma.user.create({
      data,
    });
  } catch (err: any) {
    // <- Add this block to handle Prisma unique constraint error
    if (err.code === 'P2002') {
      throw new ApiError(
        409,
        'Email already exists',
        ERROR_CODES.DUPLICATE_VALUE,
        err.meta
      );
    }
    throw new ApiError(500, 'Error creating user', ERROR_CODES.INTERNAL, err.message);
  }
};

export const updateUser = async (id: number, data: Partial<CreateUserInput>) => {
  try {
    return await prisma.user.update({ where: { id }, data });
  } catch (err: any) {
    if (err.code === 'P2025') {
      throw new ApiError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }
    throw new ApiError(500, `Error updating user with ID ${id}`, ERROR_CODES.INTERNAL, err.message);
  }
};

export const deleteUser = async (id: number) => {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (err: any) {
    if (err.code === 'P2025') {
      throw new ApiError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }
    throw new ApiError(500, `Error deleting user with ID ${id}`, ERROR_CODES.INTERNAL, err.message);
  }
};
