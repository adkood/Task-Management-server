import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  type!: "TASK_ASSIGNED" | "TASK_UPDATED";

  @Column({ type: "jsonb" })
  payload!: {
    taskId: string;
    title: string;
  };

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
