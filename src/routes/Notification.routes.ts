import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getUnread,
  markRead,
} from "../controllers/Notification.controller";

const router = Router();

router.use(authenticate);

router.get("/unread", getUnread);
router.patch("/:id/read", markRead);

export default router;
