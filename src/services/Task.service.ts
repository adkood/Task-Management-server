// services/Task.service.ts - Update with authorization
import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User"; // Add User import
import { CreateTaskDto, UpdateTaskDto } from "../dtos/Task.dto";
import { getIO } from "../socket";
import { createNotification } from "./Notification.service";
import { HttpError } from "../utils/HttpError";
import { Not } from "typeorm"; // Add this import for Not operator
import { TaskStatus } from "../enums/TaskStatus";
import { TaskPriority } from "../enums/TaskPriority";

const taskRepo = AppDataSource.getRepository(Task);
const userRepo = AppDataSource.getRepository(User); // Add user repository

// services/Task.service.ts - Fix createTask function
export const createTask = async (
  dto: CreateTaskDto,
  creatorId: string
) => {
  // Validate assigned user exists if provided
  let assignedToUser: User | null = null;

  if(!dto.assignedToId) {
    throw new HttpError(404, "User not assigned to task");
  }

  if (dto.assignedToId) {
    assignedToUser = await userRepo.findOneBy({ id: dto.assignedToId });
    if (!assignedToUser) {
      throw new HttpError(404, "Assigned user not found");
    }
  }

  // Validate creator exists
  const creatorUser = await userRepo.findOneBy({ id: creatorId });
  if (!creatorUser) {
    throw new HttpError(404, "Creator user not found");
  }

  // Validate due date is in the future
  const dueDate = new Date(dto.dueDate);
  if (dueDate <= new Date()) {
    throw new HttpError(400, "Due date must be in the future");
  }

  // Create task with proper relationship handling
  const task = new Task();
  task.title = dto.title;
  task.description = dto.description || "";
  task.dueDate = dueDate;
  task.status = dto.status || TaskStatus.TODO;
  task.priority = dto.priority || TaskPriority.MEDIUM;
  task.creator = creatorUser;
  task.creatorId = creatorId;
  
  if (assignedToUser) {
    task.assignedTo = assignedToUser;
    task.assignedToId = dto.assignedToId;
  } else {
    // Default to creator if no assignee specified
    task.assignedTo = creatorUser;
    task.assignedToId = creatorId;
  }

  await taskRepo.save(task);

  // Emit real-time event for task creation
  const io = getIO();
  
  // Load the task with relations for the event
  const taskWithRelations = await taskRepo.findOne({
    where: { id: task.id },
    relations: ["creator", "assignedTo"]
  });
  
  if (taskWithRelations) {
    io.emit("task:created", taskWithRelations);
  }

  // Send notification if assigned to someone other than creator
  if (dto.assignedToId && dto.assignedToId !== creatorId) {
    await createNotification(
      dto.assignedToId,
      "TASK_ASSIGNED",
      {
        taskId: task.id,
        title: task.title,
      }
    );
  }

  // Return the task with relations
  return taskWithRelations || task;
};

export const updateTask = async (
  taskId: string,
  dto: UpdateTaskDto,
  userId: string // Add current user ID for authorization
) => {
  const task = await taskRepo.findOne({
    where: { id: taskId },
    relations: ["creator", "assignedTo"]
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  // Authorization: Only creator or assignee can update
  const canUpdate = task.creatorId === userId || task.assignedToId === userId;
  if (!canUpdate) {
    throw new HttpError(403, "Not authorized to update this task");
  }

  const oldAssignee = task.assignedToId;
  const oldStatus = task.status;
  const oldPriority = task.priority;

  // Validate assigned user exists if changing
  if (dto.assignedToId && dto.assignedToId !== task.assignedToId) {
    const assignedUser = await userRepo.findOneBy({ id: dto.assignedToId });
    if (!assignedUser) {
      throw new HttpError(404, "Assigned user not found");
    }
  }

  // Validate due date is in the future if changing
  if (dto.dueDate) {
    const dueDate = new Date(dto.dueDate);
    if (dueDate <= new Date()) {
      throw new HttpError(400, "Due date must be in the future");
    }
  }

  Object.assign(task, {
    ...dto,
    ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
  });

  await taskRepo.save(task);

  const io = getIO();
  io.emit("task:updated", task);

  // Assignment notification
  if (dto.assignedToId && dto.assignedToId !== oldAssignee) {
    await createNotification(
      dto.assignedToId,
      "TASK_ASSIGNED",
      {
        taskId: task.id,
        title: task.title,
      }
    );
  }

  // Task updated notification (for status/priority changes)
  const statusChanged = dto.status && dto.status !== oldStatus;
  const priorityChanged = dto.priority && dto.priority !== oldPriority;
  
  if (statusChanged || priorityChanged) {
    // Notify creator and assignee (if different from updater)
    const usersToNotify = new Set<string>();
    
    if (task.creatorId !== userId) {
      usersToNotify.add(task.creatorId);
    }
    
    if (task.assignedToId && task.assignedToId !== userId) {
      usersToNotify.add(task.assignedToId);
    }
    
    // Send notifications
    for (const userToNotify of usersToNotify) {
      await createNotification(
        userToNotify,
        "TASK_UPDATED",
        {
          taskId: task.id,
          title: task.title,
          changes: {
            status: statusChanged ? dto.status : undefined,
            priority: priorityChanged ? dto.priority : undefined,
          }
        }
      );
    }
  }

  return task;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await taskRepo.findOne({
    where: { id: taskId },
    relations: ["creator"]
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  // Authorization: Only creator can delete
  if (task.creatorId !== userId) {
    throw new HttpError(403, "Only the task creator can delete this task");
  }

  await taskRepo.delete(taskId);

  // Emit real-time event for task deletion
  const io = getIO();
  io.emit("task:deleted", { taskId, deletedBy: userId });

  return true;
};

export const getTasks = async (filters: {
  status?: string;
  priority?: string;
  sort?: "ASC" | "DESC";
  userId?: string; // Add user ID for filtering
  assignedToMe?: boolean;
  createdByMe?: boolean;
  search?: string;
}) => {
  const qb = taskRepo.createQueryBuilder("task")
    .leftJoinAndSelect("task.creator", "creator")
    .leftJoinAndSelect("task.assignedTo", "assignedTo");

  // Add user-specific filters
  if (filters.userId) {
    if (filters.assignedToMe) {
      qb.andWhere("task.assignedToId = :userId", { userId: filters.userId });
    }
    
    if (filters.createdByMe) {
      qb.andWhere("task.creatorId = :userId", { userId: filters.userId });
    }
  }

  // Status filter
  if (filters.status) {
    qb.andWhere("task.status = :status", { status: filters.status });
  }

  // Priority filter
  if (filters.priority) {
    qb.andWhere("task.priority = :priority", {
      priority: filters.priority,
    });
  }

  // Search filter
  if (filters.search) {
    qb.andWhere(
      "(task.title ILIKE :search OR task.description ILIKE :search)",
      { search: `%${filters.search}%` }
    );
  }

  // Sorting
  const sortOrder = filters.sort || "ASC";
  qb.orderBy("task.dueDate", sortOrder);

  return qb.getMany();
};

export const getAssignedToUser = async (userId: string) => {
  return taskRepo.find({
    where: { assignedToId: userId },
    order: { dueDate: "ASC" },
  });
};

export const getCreatedByUser = async (userId: string) => {
  return taskRepo.find({
    where: { creatorId: userId },
  });
};

export const getOverdueTasks = async (userId?: string) => {
  const qb = taskRepo
    .createQueryBuilder("task")
    .where("task.dueDate < NOW()")
    .andWhere("task.status != 'Completed'")
    .leftJoinAndSelect("task.creator", "creator")
    .leftJoinAndSelect("task.assignedTo", "assignedTo");

  // Make it user-specific if userId is provided
  if (userId) {
    qb.andWhere("(task.creatorId = :userId OR task.assignedToId = :userId)", { 
      userId 
    });
  }

  return qb.getMany();
};