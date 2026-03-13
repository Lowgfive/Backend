import { Request, Response, NextFunction } from "express";
import { CreateChapterService, getStoryChaptersListService, readChapterAndPreloadService } from "../services/chapters.service";
import { updateReadingProgressService } from "../services/readingHistory.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getStoryChaptersList = async (req: Request, res: Response, next: NextFunction) => {
    const storyId = req.params.storyId as string;

    if (!storyId) {
        return res.status(400).json({ message: "storyId is required" });
    }

    const list = await getStoryChaptersListService(storyId);
    res.status(200).json(list);
};

export const readChapter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const storyId = req.params.storyId as string;
    const chapterNumberStr = req.params.chapterNumber as string;
    if (!storyId || !chapterNumberStr) {
        return res.status(400).json({ message: "storyId and chapterNumber are required" });
    }
    const num = parseFloat(chapterNumberStr);

    if (isNaN(num)) {
        return res.status(400).json({ message: "Invalid chapterNumber" });
    }
    
    const chapter = await readChapterAndPreloadService(storyId, num );

    // Tracks reading progress automatically if user is logged in (Non-blocking)
    const userId = req.user?.id || req.user?._id;

    if (userId && chapter && chapter._id) {
        // Run asynchronously without blocking the response
        updateReadingProgressService(userId, storyId, chapter._id.toString(), num)
            .then(() => console.log("Reading progress updated successfully"))
            .catch(err => console.error("Failed to update reading progress:", err));
    }
    
    // Trả về cho frontend ngay lập tức (dù là dữ liệu cache hay db)
    res.status(200).json(chapter);
};

export const CreateChapter = async (req: Request, res: Response, next: NextFunction) => {
    const {storyId , chapters} = req.body;
    const createC = await CreateChapterService(storyId, chapters);
    if(createC) {
        return res.status(200).json({message : "Thêm Chapter Thành Công !"});
    }
};