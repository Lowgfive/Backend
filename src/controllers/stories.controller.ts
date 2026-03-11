

import { Request, Response, NextFunction } from "express";
import { createStoryService, getHomeStoriesService, likeStoryService, toggleLikeService } from "../services/stories.service";

export const getHomeStories = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id || (req as any).user?._id;
  const limit = parseInt(req.query.limit as string) || 5;

  const result = await getHomeStoriesService(userId, limit);
  res.json(result);
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { storyId } = req.body;

  const result = await toggleLikeService(userId, storyId);

  res.json({
    message: result.liked ? "Liked story" : "Unliked story",
    liked: result.liked,
  });
};

export const getlikeStory = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const result = await likeStoryService(userId);
  res.json({ result });
};

export const createStory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, image, type, description } = req.body;
  const userId = (req as any).user.id;
  const insertStory = await createStoryService(userId, name, image, type, description);
  if (insertStory) {
    return res.status(200).json({ message: "Tạo thành công!" });
  }
};
