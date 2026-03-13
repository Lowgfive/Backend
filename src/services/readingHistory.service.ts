import ReadingHistory from "../model/readingHistory.model";

export const updateReadingProgressService = async (
  userId: string,
  storyId: string,
  chapterId: string,
  chapterNumber: number
) => {
  // Always match on (userId, storyId) to avoid duplicate upserts.
  // Only advance progress when chapterNumber is greater than stored value.
  const updatedHistory = await ReadingHistory.findOneAndUpdate(
    { userId, storyId },
    [
      {
        $set: {
          lastChapterNumber: {
            $cond: [
              {
                $or: [
                  { $eq: ["$lastChapterNumber", null] },
                  { $lt: ["$lastChapterNumber", chapterNumber] }
                ]
              },
              chapterNumber,
              "$lastChapterNumber"
            ]
          },
          lastChapterId: {
            $cond: [
              {
                $or: [
                  { $eq: ["$lastChapterNumber", null] },
                  { $lt: ["$lastChapterNumber", chapterNumber] }
                ]
              },
              chapterId,
              "$lastChapterId"
            ]
          }
        }
      },
      {
        $setOnInsert: {
          userId,
          storyId
        }
      }
    ],
    {
      upsert: true,
      returnDocument: "after",
      updatePipeline: true
    }
  );
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
          author: {
            name: authorUser?.username ?? "",
          },
        },
        lastChapterNumber: item.lastChapterNumber,
        updatedAt: item.updatedAt,
      };
    });

  return library;
};
