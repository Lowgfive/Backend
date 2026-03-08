import { Router } from "express";
import { CreateChapter, getStoryChaptersList, readChapter } from "../controllers/chapters.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

// Lấy danh mục chương (không lấy content)
router.get("/:storyId/list", getStoryChaptersList);

// Đọc một chương cụ thể (Có cơ chế Cache & Chạy ngầm Tải trước)
router.get("/:storyId/read/:chapterNumber", readChapter);

router.post("/createChapter", authenticate ,CreateChapter);

export default router;
