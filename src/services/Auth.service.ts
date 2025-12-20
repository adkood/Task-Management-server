import { AppDataSource } from "../data-source";
import { LoginDto } from "../dtos/Login.dto";
import { SignupDto } from "../dtos/Signup.dto";
import { User } from "../entities/User";
import { HttpError } from "../utils/HttpError";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/Jwt";

export const registerUser = async (data: SignupDto) => {
  const { name, bio, username, password } = data;

  if (!name || !bio || !username || !password) {
    throw new HttpError(400, "name, bio, username or password is missing");
  }

  const userRepo = AppDataSource.getRepository(User);
  const userExist = await userRepo.findOne({ where: { username } });

  if (userExist != null) {
    throw new HttpError(400, "User with this username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepo.create({
    name,
    bio,
    username,
    password: hashedPassword,
  });

  await userRepo.save(newUser);

  // removing password from response
  const { password: _, ...userWithoutPassword } = newUser;
  
  return {
    user: userWithoutPassword
  };
};

export const loginUser = async (data: LoginDto) => {
  const { username, password } = data;

  if (!username || !password) {
    throw new HttpError(400, "Username and password are required");
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { username } });

  if (!user) {
    throw new HttpError(400, "Invalid username or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new HttpError(400, "Invalid username or password");
  }

  const token = generateAccessToken({ id: user.id, username: user.username });

  // Removing password from response
  const { password: _, ...userWithoutPassword } = user;

  // token will be set in cookie by controller
  return {
    user: userWithoutPassword,
    token: token
  };
};