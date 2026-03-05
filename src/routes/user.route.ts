import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Lấy thông tin tài khoản (yêu cầu auth)
router.get("/profile", authenticate, getUserProfile);

export default router;
