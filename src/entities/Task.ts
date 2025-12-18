import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { TaskPriority } from "../enums/TaskPriority";
import { TaskStatus } from "../enums/TaskStatus";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid"  })
  creatorId!: string;

  @Column({ type: "uuid" })
  assignedToId!: string;

  @Column({ length: 100 })
  title!: string;

  @Column("text")
  description!: string;

  @Column({ type: "timestamptz" })
  dueDate!: Date;

  @Column({ type: "enum", enum: TaskPriority })
  priority!: TaskPriority;

  @Column({ type: "enum", enum: TaskStatus })
  status!: TaskStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: "creatorId" })
  creator!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assignedToId" })
  assignedTo!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
