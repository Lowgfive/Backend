import { Request, Response, NextFunction } from "express";
import { updateReadingProgressService, getLibraryByUserIdService } from "../services/readingHistory.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const updateReadingHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id || req.user?._id; // Ensure it gets the authenticated user's ID
  const { storyId, chapterId, chapterNumber } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!storyId || !chapterId || chapterNumber === undefined) {
    return res.status(400).json({ message: "storyId, chapterId, and chapterNumber are required" });
  }

  const num = parseFloat(chapterNumber);
  if (isNaN(num)) {
    return res.status(400).json({ message: "Invalid chapterNumber" });
  }

  const updatedLog = await updateReadingProgressService(userId, storyId, chapterId, num);
  res.status(200).json({
    message: "Reading progress updated successfully",
    data: updatedLog,
  });
};

export const getLibrary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id || req.user?._id;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const library = await getLibraryByUserIdService(userId);
  res.status(200).json(library);
};
