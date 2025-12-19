// controllers/Notification.controller.ts
import { Response, Request } from "express";
import {
  getUnreadNotifications,
  markAllRead,
  markNotificationAsRead,
} from "../services/Notification.service";
import { HttpError } from "../utils/HttpError";

// Add this interface if not already defined
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const getUnread = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null
      });
    }

    const data = await getUnreadNotifications(req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Unread notifications fetched successfully",
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

export const markRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null
      });
    }

    const data = await markNotificationAsRead(req.params.id, req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Notification marked as read successfully",
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

export const markAllReadController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null
      });
    }

    const data = await markAllRead(req.user.id);

    return res.status(200).json({
      status: "success",
      message: "All notifications marked as read successfully",
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