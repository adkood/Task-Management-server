import { Request, Response } from "express";
import { validate } from "class-validator";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/Task.dto";
import { TaskService } from "../services/Task.service";

const taskService = new TaskService();

export class TaskController {
  static async create(req: Request, res: Response) {
    const dto = Object.assign(new CreateTaskDto(), req.body);
    const errors = await validate(dto);

    if (errors.length) {
      return res.status(400).json(errors);
    }

    const task = await taskService.createTask(dto, req.user.id);
    res.status(201).json(task);
  }

  static async update(req: Request, res: Response) {
    const dto = Object.assign(new UpdateTaskDto(), req.body);
    const errors = await validate(dto);

    if (errors.length) {
      return res.status(400).json(errors);
    }

    const task = await taskService.updateTask(req.params.id, dto);
    res.json(task);
  }

  static async delete(req: Request, res: Response) {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  }

  static async getAll(req: Request, res: Response) {
    const tasks = await taskService.getTasks({
      status: req.query.status as string,
      priority: req.query.priority as string,
      sort: req.query.sort as "ASC" | "DESC",
    });

    res.json(tasks);
  }

  static async assignedToMe(req: Request, res: Response) {
    const tasks = await taskService.getAssignedToUser(req.user.id);
    res.json(tasks);
  }

  static async createdByMe(req: Request, res: Response) {
    const tasks = await taskService.getCreatedByUser(req.user.id);
    res.json(tasks);
  }

  static async overdue(req: Request, res: Response) {
    const tasks = await taskService.getOverdueTasks();
    res.json(tasks);
  }
}
