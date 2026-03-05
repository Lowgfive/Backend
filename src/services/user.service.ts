import { User } from "../model/user.model";
import { StoryLike } from "../model/stories.model";
import { UserProfileResponse } from "../types/profile.type";

export const getUserProfileService = async (
    userId: string
): Promise<UserProfileResponse> => {
    // 1. Fetch user without password
    const user = await User.findById(userId).select("-password -createdAt -updatedAt");
    if (!user) {
        throw new Error("User not found");
    }

    // 2. Fetch liked stories and populate the story data
    // Expected to populate the "storyId" referencing the "Story" collection.
    const likedStoriesData = await StoryLike.find({ userId })
        .populate("storyId")
        .lean();

    // Extract the populated story documents and type case them
    const likedStories = likedStoriesData
        .map((like) => like.storyId as any)
        .filter((story) => story !== null); // remove nulls if story was deleted

    // 3. Construct and return the profile format
    return {
        user: {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar: user.avatar || "",
        },
        likedStories,
    };
};
