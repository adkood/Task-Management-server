import { TaskPriority } from "../enums/TaskPriority";
import { TaskStatus } from "../enums/TaskStatus";

export class CreateTaskDto {
  title!: string;
  description!: string;
  dueDate!: string;
  priority!: TaskPriority;
  status!: TaskStatus;
  assignedToId!: string;
}

export class UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
}
