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

// FEATURE 2: Enhanced notifications with pagination and unread count
export const getAllNotifications = async (
  userId: string, 
  page: number = 1, 
  limit: number = 20,
  unreadOnly: boolean = false
) => {
  const skip = (page - 1) * limit;
  
  const qb = notificationRepo.createQueryBuilder("notification")
    .where("notification.userId = :userId", { userId });

  // Filter for unread only if requested
  if (unreadOnly) {
    qb.andWhere("notification.isRead = :isRead", { isRead: false });
  }

  // Get total count and unread count
  const total = await qb.getCount();
  
  // Get unread count separately
  const unreadCount = await notificationRepo.count({
    where: { 
      userId, 
      isRead: false 
    }
  });

  // Apply pagination and sorting (latest first)
  qb.orderBy("notification.createdAt", "DESC")
    .skip(skip)
    .take(limit);

  const notifications = await qb.getMany();

  // Return data with counts and pagination
  return { 
    notifications,
    counts: {
      total,
      unread: unreadCount
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
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

  // Emit update via socket
  const io = getIO();
  io.to(`user:${userId}`).emit("notification:read", { notificationId });

  // Return data only
  return { notification };
};

export const markAllRead = async (userId: string) => {
  await notificationRepo.update(
    { userId, isRead: false },
    { isRead: true }
  );

  // Emit update via socket
  const io = getIO();
  io.to(`user:${userId}`).emit("notification:all-read");

  // Return data only (success indicator)
  return { success: true };
};

// New: Get unread count only
export const getUnreadCount = async (userId: string) => {
  const count = await notificationRepo.count({
    where: { 
      userId, 
      isRead: false 
    }
  });
  
  return { count };
};