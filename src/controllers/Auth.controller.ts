import { NextFunction, Request, Response } from "express" 
import { SignupDto } from "../dtos/Signup.dto";
import { loginUser, registerUser } from "../services/Auth.service";
import { LoginDto } from "../dtos/Login.dto";

export const signup = async (req : Request, res : Response, next: NextFunction) => {
    try { 
        const body: SignupDto = req.body;
        const result = await registerUser(body);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {   
    const body: LoginDto = req.body;
    const result = await loginUser(body, res); // Pass res to service
    return res.status(200).json(result);
  } catch(error) {
    next(error);
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    });
  } catch(error) {
    next(error);
  }
}