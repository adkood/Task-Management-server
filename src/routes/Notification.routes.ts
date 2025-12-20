import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getAll,
  markRead,
  readAll,
  getUnread 
} from "../controllers/Notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getAll); //   ?page=1&limit=20&unreadOnly=true   
router.get("/unread", getUnread); 
router.patch("/:id/read", markRead);
router.post("/read-all", readAll);

export default router;