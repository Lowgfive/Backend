import { Types, Document } from "mongoose";

export interface IStory extends Document {
  name: string;
  image: string;
  type: string;
  description: string;
  userId : Types.ObjectId;
  likeCount: number;
  viewCount: number;
  status: string;
  createdDate: Date;
  totalChapters : number;
}

export interface IStoryLike extends Document {
  userId: Types.ObjectId;
  storyId: Types.ObjectId;
}

