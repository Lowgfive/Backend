import { Request, Response, NextFunction } from "express";
import { createCommentService } from "../services/comment.service";

export const createCommentController = async (req: Request, res: Response, next: NextFunction) => {
    const { content, storyId } = req.body;
    const userId = (req as any).user.id;
    const comment = await createCommentService({
      content,
      userId,
      storyId
    });

    res.status(201).json({
      message: "Create comment successfully",
      data: comment
    });
};