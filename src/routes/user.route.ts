import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

// Lấy thông tin tài khoản (yêu cầu auth)
router.get("/profile", authenticate, asyncHandler(getUserProfile));

export default router;
