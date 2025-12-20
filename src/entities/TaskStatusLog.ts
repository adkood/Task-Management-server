import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Task } from "./Task";
import { User } from "./User";
import { TaskStatus } from "../enums/TaskStatus";

@Entity("task_status_logs")
export class TaskStatusLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  task!: Task;

  @Column({ type: "uuid" })
  taskId!: string;

  @ManyToOne(() => User)
  updatedBy!: User;

  @Column({ type: "uuid" })
  updatedById!: string;

  @Column({ type: "enum", enum: TaskStatus })
  oldStatus!: string;

  @Column({ type: "enum", enum: TaskStatus })
  newStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
