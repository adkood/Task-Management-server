import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getAll,
  markRead,
  readAll
} from "../controllers/Notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getAll);
router.patch("/:id/read", markRead);
router.post("/read-all", readAll);

export default router;
