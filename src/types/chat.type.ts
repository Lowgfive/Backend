import { Types } from "mongoose";

export type ChatType = {
  content: string;
  userId: Types.ObjectId | string;
  roomId: string;
  createdAt?: Date;
  updatedAt?: Date;
};
