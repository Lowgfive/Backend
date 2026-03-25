import { Chapter } from "../model/chapter.model";
import { Comment } from "../model/comment.model";
import { Story } from "../model/stories.model";
import { UnlockedChapter } from "../model/unlockChapter.model";
import { User } from "../model/user.model";

type CreateAdminStoryInput = {
  adminId: string;
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  status: "ongoing" | "completed";
  genres: string[];
};

export const getDashboardStatsService = async () => {
  const [totalStories, totalChapters, totalComments, totalUsers, revenue] =
    await Promise.all([
      Story.countDocuments(),
      Chapter.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments(),
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
          },
        },
        {
          $sort: {
            totalUnlocked: -1,
          },
        },
      ]),
    ]);

  return {
    totalStories,
    totalChapters,
    totalComments,
    totalUsers,
    revenue,
  };
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
    const error = new Error("Story title already exists");
    (error as any).status = 409;
    throw error;
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
    type: normalizedGenres[0] || "Huyá»n Huyá»…n",
    userId: adminId,
  });
};
