import { Request, Response, NextFunction } from "express";
import { CreateChapterService, getStoryChaptersListService, readChapterAndPreloadService } from "../services/chapters.service";
import { updateReadingProgressService } from "../services/readingHistory.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/api-response";

export const getStoryChaptersList = async (req: Request, res: Response, next: NextFunction) => {
    const storyId = req.params.storyId as string;
    const userId = (req as any).user?.id;

    if (!storyId) {
        throw new AppError(400, "STORY_ID_REQUIRED", "story.storyIdRequired", "storyId is required");
    }

    const list = await getStoryChaptersListService(storyId, userId);
    res.status(200).json(list);
};

export const readChapter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const storyId = req.params.storyId as string;
    const chapterNumberStr = req.params.chapterNumber as string;
    if (!storyId || !chapterNumberStr) {
        throw new AppError(400, "CHAPTER_READ_REQUIRED_FIELDS", "chapter.readRequiredFields", "storyId and chapterNumber are required");
    }
    const num = parseFloat(chapterNumberStr);

    if (isNaN(num)) {
        throw new AppError(400, "CHAPTER_NUMBER_INVALID", "chapter.chapterNumberInvalid", "Invalid chapterNumber");
    }
    
    const chapter = await readChapterAndPreloadService(storyId, num);

    const userId = req.user?.id || req.user?._id;

    if (userId && chapter && chapter._id) {
        updateReadingProgressService(userId, storyId, chapter._id.toString(), num)
            .then(() => console.log("Reading progress updated successfully"))
            .catch(err => console.error("Failed to update reading progress:", err));
    }
    
    res.status(200).json(chapter);
};

export const CreateChapter = async (req: Request, res: Response, next: NextFunction) => {
    const { storyId, chapters } = req.body;
    const createC = await CreateChapterService(storyId, chapters);
    if (createC) {
        return sendSuccess(res, 200, {
            code: "CHAPTER_CREATE_SUCCESS",
            messageKey: "chapter.createSuccess",
        });
    }
};
