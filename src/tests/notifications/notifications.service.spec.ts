// src/tests/notifications/notifications.service.spec.ts

jest.mock("../../data-source", () => {
  const mockQB = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQB),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    },
  };
});

jest.mock("../../socket", () => ({
  getIO: jest.fn().mockReturnValue({ to: jest.fn().mockReturnThis(), emit: jest.fn() }),
}));

import { AppDataSource } from "../../data-source";
import { getIO } from "../../socket";
import { HttpError } from "../../utils/HttpError";
import {
  createNotification,
  getAllNotifications,
  markNotificationAsRead,
  markAllRead,
  getUnreadCount,
} from "../../services/Notification.service";
import { Notification } from "../../entities/Notification";

describe("Notification Service", () => {
  let notificationRepo: any;
  let io: any;
  let mockQB: any;

  beforeEach(() => {
    notificationRepo = AppDataSource.getRepository(Notification);
    mockQB = notificationRepo.createQueryBuilder();
    io = getIO();
    jest.clearAllMocks();
  });

  // -------------------------
  // createNotification
  // -------------------------
  describe("createNotification", () => {
    it("should create a notification and emit via socket", async () => {
      const mockNotification = { id: "n1", userId: "u1", type: "TASK_ASSIGNED", payload: {} };
      notificationRepo.create.mockReturnValue(mockNotification);

      await createNotification("u1", "TASK_ASSIGNED", { taskId: "t1", title: "Test Task" });

      expect(notificationRepo.create).toHaveBeenCalledWith({
        userId: "u1",
        type: "TASK_ASSIGNED",
        payload: { taskId: "t1", title: "Test Task" },
      });
      expect(notificationRepo.save).toHaveBeenCalledWith(mockNotification);
      expect(io.to).toHaveBeenCalledWith("user:u1");
      expect(io.emit).toHaveBeenCalledWith("notification:new", mockNotification);
    });
  });

  // -------------------------
  // getAllNotifications
  // -------------------------
  describe("getAllNotifications", () => {
    it("should return notifications with counts and pagination", async () => {
      mockQB.getMany.mockResolvedValue([{ id: "n1" }]);
      mockQB.getCount.mockResolvedValue(5);
      notificationRepo.count.mockResolvedValue(2);

      const result = await getAllNotifications("u1", 1, 2, true);

      expect(mockQB.where).toHaveBeenCalledWith("notification.userId = :userId", { userId: "u1" });
      expect(mockQB.andWhere).toHaveBeenCalledWith("notification.isRead = :isRead", { isRead: false });
      expect(result.counts.unread).toBe(2);
      expect(result.notifications.length).toBe(1);
      expect(result.pagination.page).toBe(1);
    });
  });

  // -------------------------
  // markNotificationAsRead
  // -------------------------
  describe("markNotificationAsRead", () => {
    it("should mark notification as read and emit", async () => {
      const mockNotification = { id: "n1", userId: "u1", isRead: false };
      notificationRepo.findOneBy.mockResolvedValue(mockNotification);

      const result = await markNotificationAsRead("n1", "u1");

      expect(notificationRepo.findOneBy).toHaveBeenCalledWith({ id: "n1", userId: "u1" });
      expect(notificationRepo.save).toHaveBeenCalledWith({ ...mockNotification, isRead: true });
      expect(io.to).toHaveBeenCalledWith("user:u1");
      expect(io.emit).toHaveBeenCalledWith("notification:read", { notificationId: "n1" });
      expect(result.notification.isRead).toBe(true);
    });

    it("should throw 404 if notification not found", async () => {
      notificationRepo.findOneBy.mockResolvedValue(null);
      await expect(markNotificationAsRead("n1", "u1")).rejects.toThrow(HttpError);
    });
  });

  // -------------------------
  // markAllRead
  // -------------------------
  describe("markAllRead", () => {
    it("should mark all notifications as read and emit", async () => {
      notificationRepo.update.mockResolvedValue({});
      const result = await markAllRead("u1");

      expect(notificationRepo.update).toHaveBeenCalledWith(
        { userId: "u1", isRead: false },
        { isRead: true }
      );
      expect(io.to).toHaveBeenCalledWith("user:u1");
      expect(io.emit).toHaveBeenCalledWith("notification:all-read");
      expect(result.success).toBe(true);
    });
  });

  // -------------------------
  // getUnreadCount
  // -------------------------
  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      notificationRepo.count.mockResolvedValue(3);

      const result = await getUnreadCount("u1");

      expect(notificationRepo.count).toHaveBeenCalledWith({ where: { userId: "u1", isRead: false } });
      expect(result.count).toBe(3);
    });
  });
});
