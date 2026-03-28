import { Router } from "express";
import { CreateChapter, getStoryChaptersList, readChapter } from "../controllers/chapters.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { optionalAuthenticate } from "../middlewares/optionalAuth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { unlockChapterController } from "../controllers/money.controller";

const router = Router({ mergeParams: true });

// Lấy danh mục chương (không lấy content)
router.get("/:storyId/list",optionalAuthenticate, asyncHandler(getStoryChaptersList));

// Đọc một chương cụ thể (Có cơ chế Cache & Chạy ngầm Tải trước)
router.get("/:storyId/read/:chapterNumber", optionalAuthenticate, asyncHandler(readChapter));

router.post("/createChapter", authenticate, adminMiddleware, asyncHandler(CreateChapter));

router.post("/unlockChapter", authenticate ,asyncHandler(unlockChapterController));



export default router;
