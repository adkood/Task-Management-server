import { IsString, IsEnum, IsOptional, IsDateString, MaxLength, MinLength } from "class-validator";
import { TaskPriority } from "../enums/TaskPriority";
import { TaskStatus } from "../enums/TaskStatus";

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate!: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}

export class UpdateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}