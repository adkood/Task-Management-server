// controllers/Task.controller.ts - Update all functions to use AuthenticatedRequest
import { Request, Response } from "express";
import { validate } from "class-validator";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/Task.dto";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getAssignedToUser,
  getCreatedByUser,
  getOverdueTasks,
} from "../services/Task.service";

export const create = async (req: Request, res: Response) => {
  const dto = Object.assign(new CreateTaskDto(), req.body);
  const errors = await validate(dto);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const task = await createTask(dto, req.user!.id);
  return res.status(201).json(task);
};

export const update = async (req: Request, res: Response) => {
  const dto = Object.assign(new UpdateTaskDto(), req.body);
  const errors = await validate(dto);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const task = await updateTask(req.params.id, dto, req.user!.id);
  return res.json(task);
};

export const remove = async (req: Request, res: Response) => {
  await deleteTask(req.params.id, req.user!.id);
  return res.status(204).send();
};

export const getAll = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      sort: (req.query.sort as "ASC" | "DESC") || "ASC",
      userId: req.user!.id,
      assignedToMe: req.query.assignedToMe === "true",
      createdByMe: req.query.createdByMe === "true",
      search: req.query.search as string,
    };

    const tasks = await getTasks(filters);
    
    return res.json({
      status: "success",
      data: tasks,
      filters: {
        applied: {
          status: filters.status,
          priority: filters.priority,
          sort: filters.sort,
          assignedToMe: filters.assignedToMe,
          createdByMe: filters.createdByMe,
          search: filters.search,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch tasks",
    });
  }
};

export const assignedToMe = async (
  req: Request,
  res: Response
) => {
  const tasks = await getAssignedToUser(req.user!.id);
  return res.json(tasks);
};

export const createdByMe = async (
  req: Request,
  res: Response
) => {
  const tasks = await getCreatedByUser(req.user!.id);
  return res.json(tasks);
};

export const overdue = async (req: Request, res: Response) => {
  // Make overdue tasks user-specific
  const tasks = await getOverdueTasks(req.user!.id);
  return res.json(tasks);
};