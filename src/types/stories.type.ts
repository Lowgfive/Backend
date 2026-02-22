import { Types } from "mongoose";

export interface IStory extends Document {
  name: string;
  image: string;
  type: string;
  description: string;
  likeCount: number;
}

export interface IStoryLike extends Document {
  userId: Types.ObjectId;
  storyId: Types.ObjectId;
}