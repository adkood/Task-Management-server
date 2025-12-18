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

  @Column()
  creatorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assignedToId" })
  assignedTo!: User;

  @Column()
  assignedToId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
