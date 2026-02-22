
import { Types } from "mongoose";
import { Story, StoryLike } from "../model/stories.model";

export const toggleLikeService = async (
  userId: string,
  storyId: string
) => {
  const existingLike = await StoryLike.findOne({
    userId: new Types.ObjectId(userId),
    storyId: new Types.ObjectId(storyId),
  });

  if (existingLike) {
    // unlike
    await StoryLike.deleteOne({ _id: existingLike._id });

    await Story.findByIdAndUpdate(storyId, {
      $inc: { likeCount: -1 },
    });

    return { liked: false };
  } else {
    // like
    await StoryLike.create({
      userId,
      storyId,
    });

    await Story.findByIdAndUpdate(storyId, {
      $inc: { likeCount: 1 },
    });

    return { liked: true };
  }
};