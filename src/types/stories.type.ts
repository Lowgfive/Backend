import { Types, Document } from "mongoose";

export interface IStory extends Document {
  name: string;
  image: string;
  type: string;
  description: string;
  likeCount: number;
  viewCount: number;
  status: string;
  createdDate: Date;
}

export interface IStoryLike extends Document {
  userId: Types.ObjectId;
  storyId: Types.ObjectId;
}