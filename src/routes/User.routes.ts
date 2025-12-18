import { Router } from "express";
import { fetchAllUsers, getUser, updateUser } from "../controllers/User.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/me", getUser);
router.put("/me", updateUser);
router.get('/', fetchAllUsers);

export default router;
