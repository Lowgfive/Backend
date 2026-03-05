import { IStory } from "./stories.type";

export type UserProfileResponse = {
    user: {
        _id: string;
        username: string;
        email: string;
        avatar: string;
    };
    likedStories: IStory[];
};
