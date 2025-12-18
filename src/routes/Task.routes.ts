import { Router } from "express";
import { assignedToMe, create, createdByMe, getAll, overdue, update,  } from "../controllers/Task.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/", getAll);
router.patch("/:id", update);
// router.delete("/:id");

router.get("/me/assigned", assignedToMe);
router.get("/me/created", createdByMe);
router.get("/overdue", overdue);

export default router;
