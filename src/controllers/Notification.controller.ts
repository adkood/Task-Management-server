import { Response, Request } from "express";
import {
  getUnreadNotifications,
  markAllRead,
  markNotificationAsRead,
} from "../services/Notification.service";

export const getUnread = async (req: Request, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const notifications = await getUnreadNotifications(req.user.id);
  res.json(notifications);
};

export const markRead = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const notification = await markNotificationAsRead(
    req.params.id,
    req.user.id
  );

  res.json(notification);
};

export const markAllReadController = async (
  req: Request,
  res: Response
) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await markAllRead(req.user.id);
  res.json({ success: true });
};

