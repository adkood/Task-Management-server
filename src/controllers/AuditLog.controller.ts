import { Request, Response } from "express";
import { getAuditLogsService } from "../services/AuditLog.service";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const taskId = req.query.taskId as string | undefined;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await getAuditLogsService({
      taskId,
      page,
      limit,
    });

    return res.status(200).json({
      status: "success",
      message: "Audit logs fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};
