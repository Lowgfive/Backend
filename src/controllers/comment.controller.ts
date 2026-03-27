import { NextFunction, Request, Response } from "express";
import {
  createCommentService,
  getCommentsByChapterIdService,
} from "../services/comment.service";
import { AppError } from "../utils/app-error";

export const getCommentsByChapterId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const chapterId = req.query.chapterId as string;

  if (!chapterId) {
    throw new AppError(400, "CHAPTER_ID_REQUIRED", "chapter.chapterIdRequired", "chapterId is required");
  }

  const comments = await getCommentsByChapterIdService(chapterId);
  return res.status(200).json(comments);
};

export const createCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { content, chapterId } = req.body;
  const userId = (req as any).user.id;

  if (!content || !chapterId) {
    throw new AppError(400, "COMMENT_REQUIRED_FIELDS", "comment.requiredFields", "content and chapterId are required");
  }

  const comment = await createCommentService({
    content,
    userId,
    chapterId,
  });

  res.status(201).json(comment);
};
