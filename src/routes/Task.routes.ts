import { Router } from "express";
import { 
  assignedToMe, 
  create, 
  createdByMe, 
  getAll, 
  overdue, 
  update,
  remove 
} from "../controllers/Task.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/", getAll); // ?page=1&limit=10&status=In Progress&assignedToMe=true
router.patch("/:id", update);
router.delete("/:id", remove); 

router.get("/me/assigned", assignedToMe); // ?page=1&limit=10
router.get("/me/created", createdByMe); // ?page=1&limit=10
router.get("/overdue", overdue); // ?page=1&limit=10

export default router;