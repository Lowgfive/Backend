import { NextFunction, Request, Response } from "express";
import {
  createCommentService,
  getCommentsByChapterIdService,
} from "../services/comment.service";

export const getCommentsByChapterId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const chapterId = req.query.chapterId as string;

  if (!chapterId) {
    return res.status(400).json({ message: "chapterId is required" });
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
    return res.status(400).json({ message: "content and chapterId are required" });
  }
  console.log(userId,content , chapterId)
  const comment = await createCommentService({
    content,
    userId,
    chapterId,
  });

  res.status(201).json(comment);
};
