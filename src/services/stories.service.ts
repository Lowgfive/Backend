
import mongoose, { Types } from "mongoose";
import { Story, StoryLike } from "../model/stories.model";
import { User } from "../model/user.model";
import { redisClient } from "../config/redis";

export const getHomeStoriesService = async (userId?: string, limit: number = 5) => {
  const selectFields = "name image type description likeCount createdDate viewCount status";
  const cacheKey = `home:${userId || "guest"}:${limit}`;

  // 1. Check cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [topLiked, newest, topViewed] = await Promise.all([
    Story.find()
      .sort({ likeCount: -1 })
      .limit(limit)
      .select(selectFields)
      .populate("userId", "username"),

    Story.find()
      .sort({ createdDate: -1 })
      .limit(limit)
      .select(selectFields)
      .populate("userId", "username"),

    Story.find()
      .sort({ viewCount: -1 })
      .limit(limit)
      .select(selectFields)
      .populate("userId", "username")
  ]);

  let recommendedType: string | null = null;

  if (userId) {
    const user = await User.findById(userId);
    if (user && user.reading_history && user.reading_history.length > 0) {
      const typeCounts = user.reading_history.reduce((acc: any, type: string) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      recommendedType = Object.keys(typeCounts).reduce((a, b) =>
        typeCounts[a] > typeCounts[b] ? a : b
      );
    }
  }

  if (!recommendedType) {
    const distinctTypes = await Story.distinct("type");
    if (distinctTypes.length > 0) {
      const randomIndex = Math.floor(Math.random() * distinctTypes.length);
      recommendedType = distinctTypes[randomIndex];
    }
  }

  let recommended = [];
  if (recommendedType) {
    recommended = await Story.find({ type: recommendedType })
      .limit(limit)
      .select(selectFields)
      .populate("userId", "username");
  } else {
    // Fallback if no types exist
    recommended = await Story.aggregate([
      { $sample: { size: limit } },
      { $project: { name: 1, image: 1, type: 1, description: 1, likeCount: 1, createdDate: 1, viewCount: 1, status: 1 } }
    ]);
  }
  const result = {
    topLiked,
    newest,
    topViewed,
    recommended
  };
  await redisClient.set(cacheKey, JSON.stringify(result), {
    EX: 300
  });

  return result
};

export const likeStoryService = async (userId: string) => {
  
  return await StoryLike.aggregate([
  {
    $match: {
      userId: new mongoose.Types.ObjectId(userId)
    }
  },
  {
    $lookup: {
      from: "stories",
      localField: "storyId",
      foreignField: "_id",
      as: "TableLike"
    }
  },
  {
    $unwind: "$TableLike"
  },
  {
    $group: {
      _id: null,
      totalLiked: { $sum: 1 },
      stories: { $push: "$TableLike" }
    }
  }
]);
}

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

// nen lam them cai chong spam like 

export const createStoryService = async (userId: string, name: string, image: string, type: string, description: string) => {
  const nameOfStory = await Story.find().select("name -_id");
  const existName = nameOfStory.find(item => item.name.includes(name))
  if (existName) {
    return;
  }

  const insertStory = await Story.create({
    name: name,
    image: image,
    type: type,
    description: description,
    userId: userId
  })
  return insertStory;
}

// search + filter + pagination service
export interface SearchOptions {
  q?: string;
  types?: string[];
  status?: string;
  sort?: "popular" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export const searchStoriesService = async (opts: SearchOptions) => {
  const {
    q,
    types,
    status,
    sort = "newest",
    page = 1,
    limit = 20,
  } = opts;

  const filter: any = {};
  if (q) {
    // simple text search on name and description
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if (types && types.length > 0) {
    filter.type = { $in: types };
  }
  if (status) {
    filter.status = status;
  }

  const sortOption: any = {};
  if (sort === "popular") {
    // popularity defined by likeCount and viewCount
    sortOption.likeCount = -1;
  } else if (sort === "rating") {
    sortOption.likeCount = -1; // same as popular for now
  } else {
    sortOption.createdDate = -1;
  }

  const skip = (page - 1) * limit;
  const selectFields = "name image type description likeCount createdDate viewCount status";

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select(selectFields)
      .populate("userId", "username"),
    Story.countDocuments(filter),
  ]);

  return { stories, total, page, limit };
};