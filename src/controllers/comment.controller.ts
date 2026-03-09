import { Request, Response } from "express";
import { createCommentService } from "../services/comment.service";


export const createCommentController = async (req: Request, res: Response) => {
  try {
    const { content, storyId } = req.body;
    const userId = (req as any).user.id;
    console.log(userId)
    const comment = await createCommentService({
      content,
      userId,
      storyId
    });

    res.status(201).json({
      message: "Create comment successfully",
      data: comment
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message
    });
  }
};