import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getAll,
  markRead,
  readAll,
  getUnread // Add this import
} from "../controllers/Notification.controller";

const router = Router();

router.use(authenticate);

// FEATURE 2: Routes with new query parameters
router.get("/", getAll); // Now accepts: ?page=1&limit=20&unreadOnly=true
router.get("/unread", getUnread); // New endpoint for unread count only
router.patch("/:id/read", markRead);
router.post("/read-all", readAll);

export default router;