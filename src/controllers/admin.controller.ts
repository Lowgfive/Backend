import { NextFunction, Request, Response } from "express";
import {
  createAdminStoryService,
  getDashboardStatsService,
} from "../services/admin.service";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stats = await getDashboardStatsService();
  return res.status(200).json(stats);
};

export const createStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const adminId = (req as any).user.id;
  const { title, author, description, coverImageUrl, status, genres } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: "Tiêu đề và tác giả là bắt buộc" });
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

  return res.status(201).json({
    id: story._id,
    title: story.title || story.name,
    author: story.author,
    description: story.description,
    coverImageUrl: story.coverImageUrl || story.image,
    status: story.status,
    genres: story.genres || [],
  });
};
