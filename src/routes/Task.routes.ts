import { Router } from "express";
import { TaskController } from "../controllers/Task.controller";

const router = Router();

router.post("/", TaskController.create);
router.get("/", TaskController.getAll);
router.patch("/:id", TaskController.update);
router.delete("/:id", TaskController.delete);

router.get("/me/assigned", TaskController.assignedToMe);
router.get("/me/created", TaskController.createdByMe);
router.get("/overdue", TaskController.overdue);

export default router;
