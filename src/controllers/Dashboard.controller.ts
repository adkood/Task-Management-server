// controllers/Dashboard.controller.ts
import { Request, Response } from "express";
import {
  getAssignedToUser,
  getCreatedByUser,
  getOverdueTasks,
} from "../services/Task.service";
import { HttpError } from "../utils/HttpError";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    // Get all three views in parallel
    const [
      assignedResult,
      createdResult, 
      overdueResult
    ] = await Promise.all([
      getAssignedToUser(userId),    // returns { tasks: [...] }
      getCreatedByUser(userId),     // returns { tasks: [...] }
      getOverdueTasks(userId),      // returns { tasks: [...] }
    ]);

    // Extract tasks from each result
    const assignedTasks = assignedResult.tasks;
    const createdTasks = createdResult.tasks;
    const overdueTasks = overdueResult.tasks;

    return res.status(200).json({
      status: "success",
      message: "Dashboard data fetched successfully",
      data: {
        assignedTasks,
        createdTasks,
        overdueTasks,
        summary: {
          assignedCount: assignedTasks.length,
          createdCount: createdTasks.length,
          overdueCount: overdueTasks.length,
        },
      },
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