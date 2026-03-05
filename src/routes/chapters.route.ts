import { Router } from "express";
import { getStoryChaptersList, readChapter } from "../controllers/chapters.controller";

const router = Router({ mergeParams: true });

// Lấy danh mục chương (không lấy content)
router.get("/:storyId/list", getStoryChaptersList);

// Đọc một chương cụ thể (Có cơ chế Cache & Chạy ngầm Tải trước)
router.get("/:storyId/read/:chapterNumber/:userId", readChapter);


export default router;
