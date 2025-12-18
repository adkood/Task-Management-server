import { Router } from "express";
import { getUser, updateUser } from "../controllers/User.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, getUser);
router.put("/me", authenticate, updateUser);

export default router;
