import { Router } from "express";
import { updateReadingHistory, getLibrary } from "../controllers/readingHistory.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

// Route POST /track: Lưu vết chương đang đọc
router.post("/track", authenticate, asyncHandler(updateReadingHistory));

// Route GET /library: Lấy danh sách truyện đã đọc
router.get("/library", authenticate, asyncHandler(getLibrary));

export default router;
