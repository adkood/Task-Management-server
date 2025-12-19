// services/User.service.ts
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { HttpError } from "../utils/HttpError";
import { UpdateUserDto } from "../dtos/User.dto";

export const getUserById = async (userId: string) => {
  if (!userId) {
    throw new HttpError(400, "User id is required");
  }

  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({
    where: { id: userId },
    select: ["id", "name", "bio", "username", "createdAt", "updatedAt"],
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // Return data only
  return {
    user,
  };
};

export const updateUserById = async (userId: string, data: UpdateUserDto) => {
  if (!userId) {
    throw new HttpError(400, "User id is required");
  }

  const { name, bio } = data;

  if (name == null && bio == null) {
    throw new HttpError(400, "Nothing to update");
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (name != null) user.name = name;
  if (bio != null) user.bio = bio;

  await userRepo.save(user);

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  // Return data only
  return {
    user: userWithoutPassword,
  };
};

export const getAllUsers = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({
    select: ['id', 'name', 'username', 'bio', 'createdAt'],
  });

  // Return data only
  return {
    users,
  };
};