import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/Task.dto";
import { getIO } from "../socket";

export class TaskService {
  private taskRepo = AppDataSource.getRepository(Task);

  async createTask(dto: CreateTaskDto, creatorId: string) {
    const task = this.taskRepo.create({
      ...dto,
      creatorId,
      dueDate: new Date(dto.dueDate),
    });

    await this.taskRepo.save(task);

    return task;
  }

  async updateTask(taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOneBy({ id: taskId });

    if (!task) throw new Error("Task not found");

    const oldAssignee = task.assignedToId;

    Object.assign(task, {
      ...dto,
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
    });

    await this.taskRepo.save(task);

    const io = getIO();

    io.emit("task:updated", task);

    if (dto.assignedToId && dto.assignedToId !== oldAssignee) {
      io.to(`user:${dto.assignedToId}`).emit("task:assigned", {
        taskId: task.id,
        title: task.title,
      });
    }

    return task;
  }

  async deleteTask(taskId: string) {
    await this.taskRepo.delete(taskId);
  }

  async getTasks(filters: {
    status?: string;
    priority?: string;
    sort?: "ASC" | "DESC";
  }) {
    const qb = this.taskRepo.createQueryBuilder("task");

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
  }

  async getAssignedToUser(userId: string) {
    return this.taskRepo.find({
      where: { assignedToId: userId },
      order: { dueDate: "ASC" },
    });
  }

  async getCreatedByUser(userId: string) {
    return this.taskRepo.find({
      where: { creatorId: userId },
    });
  }

  async getOverdueTasks() {
    return this.taskRepo
      .createQueryBuilder("task")
      .where("task.dueDate < NOW()")
      .andWhere("task.status != 'Completed'")
      .getMany();
  }
}
