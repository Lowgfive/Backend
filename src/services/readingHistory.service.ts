import ReadingHistory from "../model/readingHistory.model";

export const updateReadingProgressService = async (
  userId: string,
  storyId: string,
  chapterId: string,
  chapterNumber: number
) => {

  const updatedHistory = await ReadingHistory.findOneAndUpdate(
    { userId, storyId , $or: [
      { lastChapterNumber: { $lt: chapterNumber } },
      { lastChapterNumber: { $exists: false } }
    ]
 },
    {
      userId,
      storyId,
      lastChapterId: chapterId,
      lastChapterNumber: chapterNumber,
    },
    { upsert: true, returnDocument: "after" }
  );
  return updatedHistory;
};

export const getLibraryByUserIdService = async (userId: string) => {
  // Populate Story data required by FE (title, cover image, total chapters)
  const library = await ReadingHistory.find({ userId }).populate({
    path: "storyId",
    select: "title coverImage totalChapters status", // Adjust based on actual Story model properties
  }).sort({ updatedAt: -1 });
  
  return library;
};
