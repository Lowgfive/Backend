import { Request, Response, NextFunction } from "express";
import { updateReadingProgressService, getLibraryByUserIdService } from "../services/readingHistory.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/api-response";

export const updateReadingHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id || req.user?._id;
  const { storyId, chapterId, chapterNumber } = req.body;

  if (!userId) {
    throw new AppError(401, "AUTH_UNAUTHORIZED", "auth.unauthorized", "Unauthorized");
  }

  if (!storyId || !chapterId || chapterNumber === undefined) {
    throw new AppError(400, "READING_HISTORY_REQUIRED_FIELDS", "readingHistory.requiredFields", "storyId, chapterId, and chapterNumber are required");
  }

  const num = parseFloat(chapterNumber);
  if (isNaN(num)) {
    throw new AppError(400, "CHAPTER_NUMBER_INVALID", "chapter.chapterNumberInvalid", "Invalid chapterNumber");
  }

  const updatedLog = await updateReadingProgressService(userId, storyId, chapterId, num);
  return sendSuccess(res, 200, {
    code: "READING_HISTORY_UPDATE_SUCCESS",
    messageKey: "readingHistory.updateSuccess",
    data: updatedLog,
  });
};

export const getLibrary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id || req.user?._id;

  const library = await getLibraryByUserIdService(userId);
  res.status(200).json(library);
};
