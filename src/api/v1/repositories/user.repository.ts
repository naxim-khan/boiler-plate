import prisma from '../../../PrismaClient';

export interface CreateUserInput {
  name: string;
  email: string;
}

export const getUsers = async () => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, // latest users first
    });
  } catch (error) {
    throw new Error(`Error fetching users: ${(error as Error).message}`);
  }
};

export const getUserById = async (id: number) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Error fetching user with ID ${id}: ${(error as Error).message}`);
  }
};

export const createUser = async (data: CreateUserInput) => {
  try {
    return await prisma.user.create({
      data,
    });
  } catch (error) {
    throw new Error(`Error creating user: ${(error as Error).message}`);
  }
};

export const updateUser = async (id: number, data: Partial<CreateUserInput>) => {
  try {
    return await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new Error(`Error updating user with ID ${id}: ${(error as Error).message}`);
  }
};

export const deleteUser = async (id: number) => {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Error deleting user with ID ${id}: ${(error as Error).message}`);
  }
};
