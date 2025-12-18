import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";
import { getIO } from "../socket";

const notificationRepo = AppDataSource.getRepository(Notification);

export const createNotification = async (
  userId: string,
  type: "TASK_ASSIGNED" | "TASK_UPDATED",
  payload: { 
    taskId: string; 
    title: string;
    changes?: {
      status?: string;
      priority?: string;
    }
  }
) => {
  const notification = notificationRepo.create({
    userId,
    type,
    payload,
  });

  await notificationRepo.save(notification);

  // Realtime push
  const io = getIO();
  io.to(`user:${userId}`).emit("notification:new", notification);

  return notification;
};

export const getUnreadNotifications = async (userId: string) => {
  return notificationRepo.find({
    where: { userId, isRead: false },
    order: { createdAt: "DESC" },
  });
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
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  await notificationRepo.save(notification);

  return notification;
};


export const markAllRead = async (userId: string) => {
  await notificationRepo.update(
    { userId, isRead: false },
    { isRead: true }
  );
};
