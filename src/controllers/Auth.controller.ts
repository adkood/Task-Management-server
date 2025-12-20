import { NextFunction, Request, Response } from "express";
import { SignupDto } from "../dtos/Signup.dto";
import { loginUser, registerUser } from "../services/Auth.service";
import { LoginDto } from "../dtos/Login.dto";
import { HttpError } from "../utils/HttpError";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: SignupDto = req.body;
    const data = await registerUser(body);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: data
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        data: null
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null
    });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: LoginDto = req.body;
    const data = await loginUser(body);

    // Setting HttpOnly cookie
    res.cookie('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    const { token, ...userData } = data;

    return res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: userData
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        data: null
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null
    });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', 
      path: '/',
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null
    });
  }
};