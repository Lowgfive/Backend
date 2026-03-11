import { Router } from "express";
import { CreateChapter, getStoryChaptersList, readChapter } from "../controllers/chapters.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { optionalAuthenticate } from "../middlewares/optionalAuth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router({ mergeParams: true });

// Lấy danh mục chương (không lấy content)
router.get("/:storyId/list", asyncHandler(getStoryChaptersList));

// Đọc một chương cụ thể (Có cơ chế Cache & Chạy ngầm Tải trước)
router.get("/:storyId/read/:chapterNumber", optionalAuthenticate, asyncHandler(readChapter));

router.post("/createChapter", authenticate ,asyncHandler(CreateChapter));

export default router;
