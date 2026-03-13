import { Schema, model } from "mongoose";
import { IUnlockedChapter } from "../types/money.type";


const UnlockedChapterSchema = new Schema<IUnlockedChapter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: "Story",
      required: true
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    }
  },
  { timestamps: true }
);

UnlockedChapterSchema.index({ userId: 1, chapterId: 1 }, { unique: true });

export const UnlockedChapter = model<IUnlockedChapter>(
  "UnlockedChapter",
  UnlockedChapterSchema
);