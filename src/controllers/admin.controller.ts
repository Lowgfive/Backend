import { NextFunction, Request, Response } from "express";
import {
  createAdminStoryService,
  getAdminStoriesService,
  getDashboardStatsService,
  softDeleteAdminStoryService,
  updateAdminStoryService,
} from "../services/admin.service";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/api-response";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stats = await getDashboardStatsService();
  return sendSuccess(res, 200, {
    code: "ADMIN_DASHBOARD_FETCH_SUCCESS",
    messageKey: "admin.dashboardFetchSuccess",
    data: stats,
  });
};

export const createStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const adminId = (req as any).user.id;
  const { title, author, description, coverImageUrl, status, genres } = req.body;

  if (!title || !author) {
    throw new AppError(400, "ADMIN_STORY_REQUIRED_FIELDS", "admin.storyRequiredFields", "Title and author are required");
  }

  const story = await createAdminStoryService({
    adminId,
    title,
    author,
    description,
    coverImageUrl,
    status: status === "completed" ? "completed" : "ongoing",
    genres: Array.isArray(genres) ? genres : [],
  });

  return sendSuccess(res, 201, {
    code: "ADMIN_STORY_CREATE_SUCCESS",
    messageKey: "admin.storyCreateSuccess",
    data: {
      id: story._id,
      title: story.title || story.name,
      author: story.author,
      description: story.description,
      coverImageUrl: story.coverImageUrl || story.image,
      status: story.status,
      genres: story.genres || [],
    },
  });
};

export const getStories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stories = await getAdminStoriesService();

  return sendSuccess(res, 200, {
    code: "ADMIN_STORIES_FETCH_SUCCESS",
    messageKey: "admin.storiesFetchSuccess",
    data: stories,
  });
};

export const updateStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawId = req.params.id;
  const { title, author, description, coverImageUrl, status, genres } = req.body;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) {
    throw new AppError(400, "STORY_ID_REQUIRED", "story.storyIdRequired", "storyId is required");
  }

  const storyId = id;

  if (!title || !author) {
    throw new AppError(400, "ADMIN_STORY_REQUIRED_FIELDS", "admin.storyRequiredFields", "Title and author are required");
  }

  const story = await updateAdminStoryService({
    storyId,
    title,
    author,
    description,
    coverImageUrl,
    status: status === "completed" ? "completed" : "ongoing",
    genres: Array.isArray(genres) ? genres : [],
  });

  return sendSuccess(res, 200, {
    code: "ADMIN_STORY_UPDATE_SUCCESS",
    messageKey: "admin.storyUpdateSuccess",
    data: {
      id: story._id,
      title: story.title || story.name,
      author: story.author,
      description: story.description,
      coverImageUrl: story.coverImageUrl || story.image,
      status: story.status,
      genres: story.genres || [],
    },
  });
};

export const softDeleteStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) {
    throw new AppError(400, "STORY_ID_REQUIRED", "story.storyIdRequired", "storyId is required");
  }

  const story = await softDeleteAdminStoryService(id);

  return sendSuccess(res, 200, {
    code: "ADMIN_STORY_DELETE_SUCCESS",
    messageKey: "admin.storyDeleteSuccess",
    data: {
      id: story._id,
      title: story.title || story.name,
      isPublic: story.isPublic,
    },
  });
};
