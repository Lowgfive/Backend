

import { Request, Response } from "express";
import { toggleLikeService } from "../services/stories.service";


export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { storyId } = req.body;

    const result = await toggleLikeService(userId, storyId);

    res.json({
      message: result.liked ? "Liked story" : "Unliked story",
      liked: result.liked,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};