import { NextFunction, Request, Response } from "express";
import { getUserById, updateUserById } from "../services/User.service";
import { UpdateUserDto } from "../dtos/User.dto";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id; 

    const result = await getUserById(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id; 
    const body: UpdateUserDto = req.body;

    const result = await updateUserById(userId, body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
