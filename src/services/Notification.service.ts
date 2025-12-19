// services/Notification.service.ts
import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";
import { getIO } from "../socket";
import { HttpError } from "../utils/HttpError";

const notificationRepo = AppDataSource.getRepository(Notification);

export const createNotification = async (
  userId: string,
  type: "TASK_ASSIGNED" | "TASK_UPDATED",
  payload: { 
    taskId: string; 
    title: string;
    assignedBy?: string;
  }
) => {
  const notification = notificationRepo.create({
    userId,
    type,
    payload,
  });

  await notificationRepo.save(notification);

  const io = getIO();
  io.to(`user:${userId}`).emit("notification:new", notification);

  // Return data only
  return { notification };
};

export const getAllNotifications = async (userId: string) => {
  const notifications = await notificationRepo.find({
    where: { userId },
    order: { createdAt: "DESC" },
  });

  // Return data only
  return { notifications };
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const notification = await notificationRepo.findOneBy({
    id: notificationId,
    userId,
  });

  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  notification.isRead = true;
  await notificationRepo.save(notification);

  // Return data only
  return { notification };
};

export const markAllRead = async (userId: string) => {
  await notificationRepo.update(
    { userId, isRead: false },
    { isRead: true }
  );

  // Return data only (success indicator)
  return { success: true };
};