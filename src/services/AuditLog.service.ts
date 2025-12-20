// src/services/auditLog.service.ts
import { AppDataSource } from "../data-source";
import { TaskStatusLog } from "../entities/TaskStatusLog";

const taskStatusLogRepo = AppDataSource.getRepository(TaskStatusLog);

interface GetAuditLogsInput {
  taskId?: string;
  page: number;
  limit: number;
}

export const getAuditLogsService = async ({
  taskId,
  page,
  limit,
}: GetAuditLogsInput) => {
  const skip = (page - 1) * limit;

  const whereCondition = taskId ? { taskId } : {};

  const [logs, total] = await taskStatusLogRepo.findAndCount({
    where: whereCondition,
    order: {
      createdAt: "DESC",
    },
    skip,
    take: limit,
  });

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};
