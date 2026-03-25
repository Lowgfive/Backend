import { Types } from "mongoose";

export type CommentType = {
  content: string;
  userId: Types.ObjectId;
  chapterId: Types.ObjectId;
  votes?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommentResponseType = {
  id: string;
  content: string;
  userName: string;
  avatar: string;
  createdAt: Date | string;
};
