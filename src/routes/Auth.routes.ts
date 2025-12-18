import { Router } from "express";
import { login, signup, logout } from "../controllers/Auth.controller";
import { authenticate } from "../middlewares/auth.middleware"; 

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticate, logout); 

export default router;