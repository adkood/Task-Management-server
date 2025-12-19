import { Router } from "express";
import { 
  assignedToMe, 
  create, 
  createdByMe, 
  getAll, 
  overdue, 
  update,
  remove // Add this import
} from "../controllers/Task.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/", getAll); // Now accepts: ?page=1&limit=10&status=In Progress&assignedToMe=true
router.patch("/:id", update);
router.delete("/:id", remove); // FEATURE 4: Add delete route

router.get("/me/assigned", assignedToMe); // Now accepts: ?page=1&limit=10
router.get("/me/created", createdByMe); // Now accepts: ?page=1&limit=10
router.get("/overdue", overdue); // Now accepts: ?page=1&limit=10

export default router;