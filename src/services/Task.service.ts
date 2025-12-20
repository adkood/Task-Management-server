import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/Task.dto";
import { getIO } from "../socket";
import { createNotification } from "./Notification.service";
import { HttpError } from "../utils/HttpError";
import { TaskStatus } from "../enums/TaskStatus";
import { TaskPriority } from "../enums/TaskPriority";
import { In } from "typeorm";

const taskRepo = AppDataSource.getRepository(Task);
const userRepo = AppDataSource.getRepository(User);

export const createTask = async (dto: CreateTaskDto, creatorId: string) => {
  // Validate assigned user exists
  if (!dto.assignedToId) {
    throw new HttpError(400, "Task must be assigned to a User");
  }

  const assignedToUser = await userRepo.findOneBy({ id: dto.assignedToId });
  if (!assignedToUser) {
    throw new HttpError(404, "Assigned user not found");
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
  task.assignedTo = assignedToUser;
  task.assignedToId = dto.assignedToId;

  await taskRepo.save(task);

  // Load the task with relations
  const taskWithRelations = await taskRepo.findOne({
    where: { id: task.id },
    relations: ["creator", "assignedTo"]
  });

  // REQUIRED: Live update for all users viewing task list/dashboard
  const io = getIO();
  io.to("all-tasks").emit("task:created", taskWithRelations || task);

  // REQUIRED: Assignment notification (persistent + instant)
  if (dto.assignedToId && dto.assignedToId !== creatorId) {
    await createNotification(
      dto.assignedToId,
      "TASK_ASSIGNED",
      {
        taskId: task.id,
        title: task.title,
        assignedBy: creatorId,
      }
    );
    
    // Also send immediate socket notification to the assignee
    io.to(`user:${dto.assignedToId}`).emit("task:assigned-to-you", {
      taskId: task.id,
      title: task.title,
    });
  }

  // Return data only
  return { task: taskWithRelations || task };
};

export const updateTask = async (taskId: string, dto: UpdateTaskDto, userId: string) => {
  const task = await taskRepo.findOne({
    where: { id: taskId },
    relations: ["creator", "assignedTo"]
  });

  if (!task) throw new HttpError(404, "Task not found");

  const isCreator = task.creatorId === userId;
  const isAssignee = task.assignedToId === userId;

  // Only creator or assignee can update
  if (!isCreator && !isAssignee) {
    throw new HttpError(403, "Not authorized to update this task");
  }

  // -------------------------------
  // Permission checks
  // -------------------------------

  if (!isCreator) {
    // Assignee can ONLY update status
    const forbiddenFields = Object.keys(dto).filter(
      field => field !== "status"
    );
    if (forbiddenFields.length > 0) {
      throw new HttpError(403, "Assigned users can only update task status");
    }
    if (dto.status === undefined) {
      throw new HttpError(403, "Assigned users must provide status");
    }
  }

  const oldAssignee = task.assignedToId;
  const oldStatus = task.status;
  const oldPriority = task.priority;

  // -------------------------------
  // Creator-only validations
  // -------------------------------
  if (isCreator) {
    // Validate assignee exists if changing
    if (dto.assignedToId && dto.assignedToId !== task.assignedToId) {
      const assignedUser = await userRepo.findOneBy({ id: dto.assignedToId });
      if (!assignedUser) throw new HttpError(404, "Assigned user not found");
      task.assignedToId = dto.assignedToId;
    }

    // Validate due date
    if (dto.dueDate) {
      const dueDate = new Date(dto.dueDate);
      if (dueDate <= new Date()) throw new HttpError(400, "Due date must be in the future");
      task.dueDate = dueDate;
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
  }

  // -------------------------------
  // Status can be updated by anyone with permission
  // -------------------------------
  if (dto.status !== undefined) task.status = dto.status;

  await taskRepo.save(task);

  // -------------------------------
  // Emit updates via Socket.IO
  // -------------------------------
  const io = getIO();
  const updatedTask = await taskRepo.findOne({
    where: { id: task.id },
    relations: ["creator", "assignedTo"]
  });

  io.to("all-tasks").emit("task:updated", updatedTask || task);

  // Assignment notification
  if (dto.assignedToId && dto.assignedToId !== oldAssignee) {
    await createNotification(
      dto.assignedToId,
      "TASK_ASSIGNED",
      { taskId: task.id, title: task.title, assignedBy: userId }
    );
    io.to(`user:${dto.assignedToId}`).emit("task:assigned-to-you", {
      taskId: task.id,
      title: task.title
    });
  }

  // Notify on status/priority changes
  const statusChanged = dto.status && dto.status !== oldStatus;
  const priorityChanged = dto.priority && dto.priority !== oldPriority;

  if ((statusChanged || priorityChanged) && task.assignedToId && task.assignedToId !== userId) {
    await createNotification(
      task.assignedToId,
      "TASK_UPDATED",
      { taskId: task.id, title: task.title }
    );
  }

  return { task: updatedTask || task };
};


// FEATURE 4: Delete task (already implemented)
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

  // Live update for all users
  const io = getIO();
  io.to("all-tasks").emit("task:deleted", { 
    taskId, 
    deletedBy: userId 
  });

  // Return data only (success indication)
  return { success: true };
};

// FEATURE 3: Pagination for tasks
export const getTasks = async (filters: {
  status?: string;
  priority?: string;
  sort?: "ASC" | "DESC";
  userId?: string;
  assignedToMe?: boolean;
  createdByMe?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

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

    // If no specific filter, show tasks user is involved with
    if (!filters.assignedToMe && !filters.createdByMe) {
      qb.andWhere("(task.creatorId = :userId OR task.assignedToId = :userId)", { 
        userId: filters.userId 
      });
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

  // REQUIRED: Sorting by Due Date
  const sortOrder = filters.sort || "ASC";
  qb.orderBy("task.dueDate", sortOrder);

  // Get total count for pagination
  const total = await qb.getCount();
  
  // Apply pagination
  qb.skip(skip).take(limit);

  const tasks = await qb.getMany();
  
  return { 
    tasks,
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

export const getAssignedToUser = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [tasks, total] = await taskRepo.findAndCount({
    where: { assignedToId: userId },
    relations: ["creator", "assignedTo"],
    order: { dueDate: "ASC" },
    skip,
    take: limit,
  });
  
  // Return data only with pagination
  return { 
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getCreatedByUser = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [tasks, total] = await taskRepo.findAndCount({
    where: { creatorId: userId },
    relations: ["creator", "assignedTo"],
    order: { dueDate: "DESC" },
    skip,
    take: limit,
  });
  
  // Return data only with pagination
  return { 
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }; 
};

export const getUrgentTasks = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [tasks, total] = await taskRepo.findAndCount({
    where: [
      { creatorId: userId, priority: TaskPriority.URGENT },
      { assignedTo: { id: userId }, priority: TaskPriority.URGENT }
    ],
    relations: ["creator", "assignedTo"],
    order: { dueDate: "DESC" },
    skip,
    take: limit,
  });
  
  // Return data only with pagination
  return { 
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }; 
};

export const getOverdueTasks = async (userId?: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const qb = taskRepo
    .createQueryBuilder("task")
    .where("task.dueDate < NOW()")
    .andWhere("task.status != :completedStatus", { 
      completedStatus: TaskStatus.COMPLETED 
    })
    .leftJoinAndSelect("task.creator", "creator")
    .leftJoinAndSelect("task.assignedTo", "assignedTo");

  // Make it user-specific if userId is provided
  if (userId) {
    qb.andWhere("(task.creatorId = :userId OR task.assignedToId = :userId)", { 
      userId 
    });
  }

  // Get total count
  const total = await qb.getCount();
  
  // Apply pagination
  qb.skip(skip).take(limit);
  
  const tasks = await qb.getMany();
  
  // Return data only with pagination
  return { 
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }; 
};