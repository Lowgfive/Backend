import { Chapter } from "../model/chapter.model";
import { redisClient } from "../config/redis";
import { Chat } from "../model/chat.model";
import { Comment } from "../model/comment.model";
import { Story } from "../model/stories.model";
import { Transaction } from "../model/transaction.model";
import { UnlockedChapter } from "../model/unlockChapter.model";
import { User } from "../model/user.model";
import { AppError } from "../utils/app-error";

type CreateAdminStoryInput = {
  adminId: string;
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  status: "ongoing" | "completed";
  genres: string[];
};

type UpdateAdminStoryInput = {
  storyId: string;
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  status: "ongoing" | "completed";
  genres: string[];
};

const deleteKeysByPatterns = async (patterns: string[]) => {
  if (!redisClient.isOpen) return;

  for (const pattern of patterns) {
    const keys = await redisClient.keys(pattern);
    if (keys.length) {
      await redisClient.del(keys);
    }
  }
};

export const getDashboardStatsService = async () => {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [
    totalStories,
    totalChapters,
    totalComments,
    totalUsers,
    totalChatMessages,
    storyViewSummary,
    totalTopupTransactions,
    totalTopupAmountSummary,
    revenue,
    topStoriesByViews,
    topStoriesByLikes,
    topStoriesByUnlocks,
    paidUsersGrouped,
    newUsersTimeline,
  ] = await Promise.all([
    Story.countDocuments(),
    Chapter.countDocuments(),
    Comment.countDocuments(),
    User.countDocuments(),
    Chat.countDocuments(),
    Story.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $ifNull: ["$viewCount", 0] } },
        },
      },
    ]),
    Transaction.countDocuments({ source: "topup" }),
    Transaction.aggregate([
      {
        $match: {
          source: "topup",
        },
      },
      {
        $group: {
          _id: null,
          totalTopupAmount: { $sum: { $ifNull: ["$metadata.amountVnd", 0] } },
        },
      },
    ]),
    UnlockedChapter.aggregate([
      {
        $group: {
          _id: "$storyId",
          totalUnlocked: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "stories",
          localField: "_id",
          foreignField: "_id",
          as: "story",
        },
      },
      {
        $unwind: {
          path: "$story",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          storyId: "$_id",
          totalUnlocked: 1,
          title: {
            $ifNull: ["$story.title", "$story.name"],
          },
          viewCount: {
            $ifNull: ["$story.viewCount", 0],
          },
          likeCount: {
            $ifNull: ["$story.likeCount", 0],
          },
        },
      },
      {
        $sort: {
          totalUnlocked: -1,
        },
      },
      {
        $limit: 5,
      },
    ]),
    Story.find()
      .sort({ viewCount: -1, createdDate: -1 })
      .limit(5)
      .select("title name viewCount likeCount")
      .lean(),
    Story.find()
      .sort({ likeCount: -1, createdDate: -1 })
      .limit(5)
      .select("title name viewCount likeCount")
      .lean(),
    UnlockedChapter.aggregate([
      {
        $group: {
          _id: "$storyId",
          totalUnlocked: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "stories",
          localField: "_id",
          foreignField: "_id",
          as: "story",
        },
      },
      {
        $unwind: {
          path: "$story",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          storyId: "$_id",
          totalUnlocked: 1,
          title: {
            $ifNull: ["$story.title", "$story.name"],
          },
          viewCount: {
            $ifNull: ["$story.viewCount", 0],
          },
          likeCount: {
            $ifNull: ["$story.likeCount", 0],
          },
        },
      },
      {
        $sort: {
          totalUnlocked: -1,
        },
      },
      {
        $limit: 5,
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          source: { $in: ["topup", "unlock_chapter"] },
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
    ]),
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]),
  ]);

  const totalViews = storyViewSummary[0]?.totalViews || 0;
  const totalTopupAmount = totalTopupAmountSummary[0]?.totalTopupAmount || 0;
  const paidUsers = paidUsersGrouped.length;
  const paidUserRate = totalUsers > 0 ? Number(((paidUsers / totalUsers) * 100).toFixed(2)) : 0;

  const userTimelineMap = new Map<string, number>();
  newUsersTimeline.forEach((item: any) => {
    const year = item._id?.year;
    const month = String(item._id?.month || "").padStart(2, "0");
    const day = String(item._id?.day || "").padStart(2, "0");
    userTimelineMap.set(`${year}-${month}-${day}`, item.newUsers || 0);
  });

  const usersByDate = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      newUsers: userTimelineMap.get(key) || 0,
    };
  });

  const normalizeTopStory = (story: any) => ({
    storyId: String(story.storyId || story._id || ""),
    title: story.title || story.name || "Untitled",
    viewCount: story.viewCount || 0,
    likeCount: story.likeCount || 0,
    totalUnlocked: story.totalUnlocked || 0,
  });

  return {
    totalStories,
    totalChapters,
    totalComments,
    totalUsers,
    totalViews,
    totalChatMessages,
    totalTopupTransactions,
    totalTopupAmount,
    paidUsers,
    paidUserRate,
    usersByDate,
    revenue,
    topStories: {
      byViews: topStoriesByViews.map(normalizeTopStory),
      byLikes: topStoriesByLikes.map(normalizeTopStory),
      byUnlocks: topStoriesByUnlocks.map(normalizeTopStory),
    },
  };
};

export const getAdminStoriesService = async () => {
  return await Story.find()
    .sort({ createdDate: -1 })
    .select("title name author description coverImageUrl image status genres viewCount totalChapters createdDate isPublic")
    .lean();
};

export const createAdminStoryService = async ({
  adminId,
  title,
  author,
  description = "",
  coverImageUrl = "",
  status,
  genres,
}: CreateAdminStoryInput) => {
  const normalizedTitle = title.trim();
  const normalizedAuthor = author.trim();
  const normalizedGenres = [...new Set(genres.map((genre) => genre.trim()).filter(Boolean))];

  const existingStory = await Story.findOne({
    $or: [{ title: normalizedTitle }, { name: normalizedTitle }],
  }).lean();

  if (existingStory) {
    throw new AppError(409, "STORY_TITLE_EXISTS", "story.titleExists", "Story title already exists");
  }

  return Story.create({
    title: normalizedTitle,
    author: normalizedAuthor,
    description: description.trim(),
    coverImageUrl: coverImageUrl.trim(),
    status: status === "completed" ? "Completed" : "Ongoing",
    genres: normalizedGenres,
    name: normalizedTitle,
    image: coverImageUrl.trim() || "https://placehold.co/600x900?text=Storytime",
    type: normalizedGenres[0] || "Fantasy",
    isPublic: true,
    userId: adminId,
  });
};

export const updateAdminStoryService = async ({
  storyId,
  title,
  author,
  description = "",
  coverImageUrl = "",
  status,
  genres,
}: UpdateAdminStoryInput) => {
  const normalizedTitle = title.trim();
  const normalizedAuthor = author.trim();
  const normalizedGenres = [...new Set(genres.map((genre) => genre.trim()).filter(Boolean))];

  const existingStory = await Story.findOne({
    _id: { $ne: storyId },
    $or: [{ title: normalizedTitle }, { name: normalizedTitle }],
  }).lean();

  if (existingStory) {
    throw new AppError(409, "STORY_TITLE_EXISTS", "story.titleExists", "Story title already exists");
  }

  const updatedStory = await Story.findByIdAndUpdate(
    storyId,
    {
      title: normalizedTitle,
      author: normalizedAuthor,
      description: description.trim(),
      coverImageUrl: coverImageUrl.trim(),
      status: status === "completed" ? "Completed" : "Ongoing",
      genres: normalizedGenres,
      name: normalizedTitle,
      image: coverImageUrl.trim() || "https://placehold.co/600x900?text=Storytime",
      type: normalizedGenres[0] || "Fantasy",
    },
    { new: true }
  );

  if (!updatedStory) {
    throw new AppError(404, "STORY_NOT_FOUND", "story.notFound", "Story not found");
  }

  return updatedStory;
};

export const softDeleteAdminStoryService = async (storyId: string) => {
  const updatedStory = await Story.findByIdAndUpdate(
    storyId,
    { isPublic: false },
    { new: true }
  );

  if (!updatedStory) {
    throw new AppError(404, "STORY_NOT_FOUND", "story.notFound", "Story not found");
  }

  await deleteKeysByPatterns([
    "home:*",
    `listChapters:${storyId}:*`,
    `Chapter:${storyId}:*`,
    `View${storyId}:*`,
  ]);

  return updatedStory;
};
