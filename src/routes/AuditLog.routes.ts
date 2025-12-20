import { Router } from "express";
import { getAuditLogs } from "../controllers/AuditLog.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/logs",
  authenticate,
  getAuditLogs
);

export default router;
