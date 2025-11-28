import prisma from '../PrismaClient';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';
import { handlePrismaError } from '../utils/prismaError';
import type { CreateUserInput } from '../services/user.service';
import {paginate} from '../utils/pagintion.util';
import type { PaginatedResult } from '../utils/pagintion.util';
// import { buildUserFilters } from '../utils/userFilters';

// Safe user selection (exclude password)
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl:true,
  createdAt: true,
  updatedAt: true,
} as const;

// For auth - includes password
const userSelectWithPassword = {
  id: true,
  name: true,
  email: true,
  password: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface CreateUserData extends CreateUserInput {
  role?: string;
}

export interface UpdateUserData extends Partial<CreateUserInput> {
  role?: string;
}

export const getUsers = async () => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    });
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

// Cursor-based pagination + filtering + sorting
export const getUsersPaginated = async (
  limit: number,
  cursor?: number,
  where?: any,
  orderBy: Record<string, 'asc' | 'desc'> = { id: 'asc' } 
): Promise<
  PaginatedResult<{
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }>
> => {
  try {
    return await paginate({
      prisma,
      model: "user",
      select: userSelect,
      limit,
      cursor,
      orderBy,
      where,
    });
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};



export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: userSelect,
    });
    
    if (!user) {
      throw new ApiError(
        404, 
        `User with ID ${id} not found`, 
        ERROR_CODES.NOT_FOUND,
        { userId: id }
      );
    }
    
    return user;
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: userSelectWithPassword,
    });

    if (!user) {
      throw new ApiError(
        404,
        `User with email ${email} not found`,
        ERROR_CODES.NOT_FOUND,
        { email }
      );
    }

    return user;
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const getUserByEmailPublic = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });

    if (!user) {
      throw new ApiError(
        404,
        `User with email ${email} not found`,
        ERROR_CODES.NOT_FOUND,
        { email }
      );
    }

    return user;
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const createUser = async (data: CreateUserData) => {
  try {
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email } 
    });
    
    if (existingUser) {
      throw new ApiError(
        409,
        'A user with this email already exists',
        ERROR_CODES.DUPLICATE_VALUE,
        { email: data.email }
      );
    }

    // Create user with all required fields
    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'USER',
    };

    return await prisma.user.create({
      data: userData,
      select: userSelect,
    });
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const updateUser = async (id: number, data: UpdateUserData) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new ApiError(
        404,
        `User with ID ${id} not found`,
        ERROR_CODES.NOT_FOUND,
        { userId: id }
      );
    }

    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (userWithEmail) {
        throw new ApiError(
          409,
          'A user with this email already exists',
          ERROR_CODES.DUPLICATE_VALUE,
          { email: data.email }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role;

    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const deleteUser = async (id: number) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new ApiError(
        404,
        `User with ID ${id} not found`,
        ERROR_CODES.NOT_FOUND,
        { userId: id }
      );
    }

    return await prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const userExists = async (id: number): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

export const emailExists = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};

// Profile Image upload
export const updateUserAvatar = async (userId: number, avatarUrl: string) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ApiError(
        404,
        `User with ID ${userId} not found`,
        ERROR_CODES.NOT_FOUND,
        { userId }
      );
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: userSelect,
    });
  } catch (err: any) {
    throw handlePrismaError(err);
  }
};
