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
import { HttpError } from "../utils/HttpError";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dto = Object.assign(new CreateTaskDto(), req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        data: { errors }
      });
    }

    const data = await createTask(dto, req.user!.id);

    return res.status(201).json({
      status: "success",
      message: "Task created successfully",
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

export const update = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dto = Object.assign(new UpdateTaskDto(), req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        data: { errors }
      });
    }

    const data = await updateTask(req.params.id, dto, req.user!.id);

    return res.status(200).json({
      status: "success",
      message: "Task updated successfully",
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

export const remove = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await deleteTask(req.params.id, req.user!.id);

    return res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
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

export const getAll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      sort: (req.query.sort as "ASC" | "DESC") || "ASC",
      userId: req.user!.id,
      assignedToMe: req.query.assignedToMe === "true",
      createdByMe: req.query.createdByMe === "true",
      search: req.query.search as string,
      page,
      limit,
    };

    const data = await getTasks(filters);

    return res.status(200).json({
      status: "success",
      message: "Tasks fetched successfully",
      data: data,
      filters: {
        applied: {
          status: filters.status,
          priority: filters.priority,
          sort: filters.sort,
          assignedToMe: filters.assignedToMe,
          createdByMe: filters.createdByMe,
          search: filters.search,
          page: filters.page,
          limit: filters.limit,
        },
      },
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

export const assignedToMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const data = await getAssignedToUser(req.user!.id, page, limit);

    return res.status(200).json({
      status: "success",
      message: "Assigned tasks fetched successfully",
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

export const createdByMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const data = await getCreatedByUser(req.user!.id, page, limit);

    return res.status(200).json({
      status: "success",
      message: "Created tasks fetched successfully",
      data: data.tasks,
      pagination: data.pagination
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

export const overdue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const data = await getOverdueTasks(req.user!.id, page, limit);

    return res.status(200).json({
      status: "success",
      message: "Overdue tasks fetched successfully",
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