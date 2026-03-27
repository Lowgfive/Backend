import { User } from "../model/user.model";
import { StoryLike } from "../model/stories.model";
import { UserProfileResponse } from "../types/profile.type";
import { AppError } from "../utils/app-error";

export const getUserProfileService = async (
    userId: string
): Promise<UserProfileResponse> => {
    const user = await User.findById(userId).select("-password -createdAt -updatedAt");
    if (!user) {
        throw new AppError(404, "USER_NOT_FOUND", "user.notFound", "User not found");
    }

    const likedStoriesData = await StoryLike.find({ userId })
        .populate("storyId")
        .lean();

    const likedStories = likedStoriesData
        .map((like) => like.storyId as any)
        .filter((story) => story !== null);

    return {
        user: {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar: user.avatar || "",
            role: "user"
        },
        likedStories,
    };
};
