import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getDashboard } from "../controllers/Dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/", getDashboard);

export default router;