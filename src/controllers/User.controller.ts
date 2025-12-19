// controllers/User.controller.ts
import { NextFunction, Request, Response } from "express";
import { getUserById, updateUserById, getAllUsers } from "../services/User.service";
import { UpdateUserDto } from "../dtos/User.dto";
import { HttpError } from "../utils/HttpError";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const data = await getUserById(userId);

    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
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

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const body: UpdateUserDto = req.body;
    const data = await updateUserById(userId, body);

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
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

export const fetchAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getAllUsers();

    return res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
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