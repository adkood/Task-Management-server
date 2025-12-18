import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { HttpError } from "../utils/HttpError";
import { UpdateUserDto } from "../dtos/User.dto";

export const getUserById = async (userId: string) => {
  try {
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

    return {
      status: "success",
      message: "User fetched successfully",
      data: {
        user,
      },
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong");
  }
};

export const updateUserById = async (
  userId: string,
  data: UpdateUserDto
) => {
  try {
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

    return {
      status: "success",
      message: "User updated successfully",
      data: {
        user,
      },
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong");
  }
};

export const getAllUsers = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({
    select: ['id', 'name', 'username', 'bio', 'createdAt'],
  });
  return {
    status: "success",
    message: "User updated successfully",
    data: {
      users,
    },
  }
};