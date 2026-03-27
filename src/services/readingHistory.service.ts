import { Types } from "mongoose";
import ReadingHistory from "../model/readingHistory.model";
import { redisClient } from "../config/redis";

export const updateReadingProgressService = async (
  userId: string,
  storyId: string,
  chapterId: string,
  chapterNumber: number
) => {
  const history = await ReadingHistory.findOne({ userId, storyId });

  // chưa có lịch sử đọc -> tạo mới
  if (!history) {
    const newHistory = await ReadingHistory.create({
      userId,
      storyId,
      lastChapterId: chapterId,
      lastChapterNumber: chapterNumber
    });

    return newHistory;
  }

  // nếu chapter mới lớn hơn thì update
  if (chapterNumber > (history.lastChapterNumber ?? 0)) {
    history.lastChapterId = new Types.ObjectId(chapterId);
    history.lastChapterNumber = chapterNumber;
    await history.save();
  }

  return history;
};

export const getLibraryByUserIdService = async (userId: string) => {

  const histories = await ReadingHistory.find({ userId })
    .select("storyId lastChapterNumber updatedAt")
    .populate({
      path: "storyId",
      select:
        "_id name image type likeCount viewCount totalChapters userId status",
      populate: {
        path: "userId",
        select: "username",
      },
    })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();

  const library = histories
    .filter((item: any) => item.storyId)
    .map((item: any) => {
      const story = item.storyId as any;
      const authorUser = story.userId as any;


      return {
        story: {
          _id: story._id,
          name: story.name,
          image: story.image,
          type: story.type,
          likeCount: story.likeCount,
          viewCount: story.viewCount,
          totalChapters: story.totalChapters,
          author: story.author || authorUser?.username || "",
        },
        lastChapterNumber: item.lastChapterNumber,
        updatedAt: item.updatedAt,
      };
    });
  return library;
};
