import { Request, Response, NextFunction } from "express";
import { createStoryService, getHomeStoriesService, likeStoryService, toggleLikeService, searchStoriesService, checkLikeService, getStoryByIdService } from "../services/stories.service";
import mongoose from "mongoose";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/api-response";

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

  return sendSuccess(res, 200, {
    code: result.liked ? "STORY_LIKED" : "STORY_UNLIKED",
    messageKey: result.liked ? "story.liked" : "story.unliked",
    liked: result.liked,
  });
};

export const checkLike = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { storyId } = (req as any).params;

  if (!storyId) {
    throw new AppError(400, "STORY_ID_REQUIRED", "story.storyIdRequired", "storyId is required");
  }

  const isLiked = await checkLikeService(userId, storyId);
  res.json({
    liked: isLiked
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
    return sendSuccess(res, 200, {
      code: "STORY_CREATE_SUCCESS",
      messageKey: "story.createSuccess",
    });
  }
};

export const getStories = async (req: Request, res: Response, next: NextFunction) => {
  const {
    q,
    sort,
    status,
    types,
    page = "1",
    limit = "20",
  } = req.query as any;

  const options = {
    q,
    sort,
    status,
    types: types ? types.split(",") : undefined,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const result = await searchStoriesService(options as any);
  res.json(result);
};

export const getStoryById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as any;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "STORY_ID_INVALID", "story.storyIdInvalid", "Invalid story id");
  }

  const story = await getStoryByIdService(id);
  if (!story) {
    throw new AppError(404, "STORY_NOT_FOUND", "story.notFound", "Story not found");
  }

  return res.json(story);
};
