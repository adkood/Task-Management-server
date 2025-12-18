import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/Task.dto";
import { getIO } from "../socket";
import { createNotification } from "./Notification.service";
import { HttpError } from "../utils/HttpError";

const taskRepo = AppDataSource.getRepository(Task);

export const createTask = async (
  dto: CreateTaskDto,
  creatorId: string
) => {
  const task = taskRepo.create({
    ...dto,
    creatorId,
    dueDate: new Date(dto.dueDate),
  });

  await taskRepo.save(task);
  return task;
};

export const updateTask = async (
  taskId: string,
  dto: UpdateTaskDto
) => {
  const task = await taskRepo.findOneBy({ id: taskId });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  const oldAssignee = task.assignedToId;

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

  return task;
};

export const deleteTask = async (taskId: string) => {
  await taskRepo.delete(taskId);
};

export const getTasks = async (filters: {
  status?: string;
  priority?: string;
  sort?: "ASC" | "DESC";
}) => {
  const qb = taskRepo.createQueryBuilder("task");

  if (filters.status) {
    qb.andWhere("task.status = :status", { status: filters.status });
  }

  if (filters.priority) {
    qb.andWhere("task.priority = :priority", {
      priority: filters.priority,
    });
  }

  if (filters.sort) {
    qb.orderBy("task.dueDate", filters.sort);
  }

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

export const getOverdueTasks = async () => {
  return taskRepo
    .createQueryBuilder("task")
    .where("task.dueDate < NOW()")
    .andWhere("task.status != 'Completed'")
    .getMany();
};
