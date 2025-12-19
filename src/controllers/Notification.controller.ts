import { Response, Request } from "express";
import {
  getAllNotifications,
  markAllRead,
  markNotificationAsRead,
  getUnreadCount,
} from "../services/Notification.service";
import { HttpError } from "../utils/HttpError";

// Add this interface if not already defined
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

// FEATURE 2: Updated with pagination and unread count
export const getAll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === "true";
    
    const data = await getAllNotifications(req.user.id, page, limit, unreadOnly);

    return res.status(200).json({
      status: "success",
      message: "Notifications fetched successfully",
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

// New endpoint: Get unread count only
export const getUnread = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null
      });
    }

    const data = await getUnreadCount(req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Unread count fetched successfully",
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

export const readAll = async (
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