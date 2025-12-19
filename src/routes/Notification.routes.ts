import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getUnread,
  markRead,
} from "../controllers/Notification.controller";
import { markAllRead } from "../services/Notification.service";

const router = Router();

router.use(authenticate);

router.get("/unread", getUnread);
router.patch("/:id/read", markRead);
router.post("/read-all", markAllRead);

export default router;
