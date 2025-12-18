import { Request, Response } from "express";
import {
  getAssignedToUser,
  getCreatedByUser,
  getOverdueTasks,
  getTasks,
} from "../services/Task.service";

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
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      getAssignedToUser(userId),
      getCreatedByUser(userId),
      getOverdueTasks(userId), 
    ]);

    return res.status(200).json({
      status: "success",
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
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to load dashboard",
    });
  }
};