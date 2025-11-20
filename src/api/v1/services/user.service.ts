import * as userRepo from '../repositories/user.repository';

export const getAllUsersService = async () => {
  return userRepo.getUsers();
};

export const createUserService = async (data: { name: string; email: string }) => {
  return userRepo.createUser(data);
};
