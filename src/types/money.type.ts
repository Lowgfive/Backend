import { Types } from "mongoose"

export type IMoney = {
    userId : Types.ObjectId,
    balance : number
}

export type ITransaction = {
  userId: Types.ObjectId;
  amount: number;
  type: "earn" | "spend";
  source: "unlock_chapter" | "topup" | "event" | "admin";
  storyId?: Types.ObjectId;
  chapterId?: Types.ObjectId;
  provider?: "vnpay";
  paymentRef?: string;
  metadata?: Record<string, unknown>;
};

export type IUnlockedChapter = {
  userId: Types.ObjectId;
  storyId: Types.ObjectId;
  chapterId: Types.ObjectId;
};

