import * as userRepo from '../repositories/user.repository';

export interface CreateUserInput {
  name: string;
  email: string;
}

export const getAllUsersService = async () => {
  return userRepo.getUsers();
};

export const getUserByIdService = async (id: number) => {
  return userRepo.getUserById(id);
};

export const createUserService = async (data: CreateUserInput) => {
  return userRepo.createUser(data);
};

export const updateUserService = async (id: number, data: Partial<CreateUserInput>) => {
  return userRepo.updateUser(id, data);
};

export const deleteUserService = async (id: number) => {
  return userRepo.deleteUser(id);
};
