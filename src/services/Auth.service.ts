import { Response } from "express";
import { AppDataSource } from "../data-source";
import { LoginDto } from "../dtos/Login.dto";
import { SignupDto } from "../dtos/Signup.dto";
import { User } from "../entities/User";
import { HttpError } from "../utils/HttpError";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/Jwt";

export const registerUser = async (data: SignupDto) => {
    try {

        const { name, bio, username, password } = data;
                
        if(name == null || bio == null || username == null || password == null) {
            throw new HttpError(400, "name, bio, username or password is missing");
        }
        
        const userRepo = AppDataSource.getRepository(User);

        const userExist = await userRepo.findOne({ where: { username } });

        if(userExist != null) {
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

        return {
            status: "success",
            message: "User registered",
            data: {
                user: newUser
            }
        }

    } catch (error) {

        if(error instanceof HttpError) {
            throw error;
        }

        throw new HttpError(500, "Something went wrong");
    }
}

// services/Auth.service.ts - Update loginUser function
export const loginUser = async (data: LoginDto, res: Response) => { // Add res parameter
  try {
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

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      status: "success", 
      message: "User logged in successfully",
      data: {
        user: userWithoutPassword
        // Don't send token in response body when using cookies
      }
    };
  } catch(error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Something went wrong");
  }
}