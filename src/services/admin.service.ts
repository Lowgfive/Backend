import { Chapter } from "../model/chapter.model";
import { Comment } from "../model/comment.model";
import { Story } from "../model/stories.model";
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
            totalUnlocked: { $sum: 1 }
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
    console.log(revenue + "so du")
  return {
    totalStories,
    totalChapters,
    totalComments,
    totalUsers,
    revenue,
  };
};

export const getAdminStoriesService = async () => {
  return await Story.find()
    .sort({ createdDate: -1 })
    .select("title name author description coverImageUrl image status genres viewCount totalChapters createdDate")
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
