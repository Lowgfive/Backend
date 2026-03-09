
import { Types } from "mongoose";

export type CommentType = {
  content: string;
  userId: Types.ObjectId;
  storyId: Types.ObjectId;
  votes?: number;
  createdAt?: Date;
  updatedAt?: Date;
};