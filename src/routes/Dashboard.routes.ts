// routes/Dashboard.routes.ts - Simple version
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getDashboard } from "../controllers/Dashboard.controller";

const router = Router();

router.use(authenticate);

// Single dashboard endpoint that shows all three views
router.get("/", getDashboard);

export default router;