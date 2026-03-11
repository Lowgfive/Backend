import mongoose, { Schema, Document } from "mongoose";

export interface IReadingHistory extends Document {
  userId: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  lastChapterId: mongoose.Types.ObjectId;
  lastChapterNumber: number;
}

const ReadingHistorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
    lastChapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    lastChapterNumber: { type: Number, required: true },
  },
  { timestamps: true }
);

// Apply Unique Index as requested
ReadingHistorySchema.index({ userId: 1, storyId: 1 }, { unique: true });

export default mongoose.model<IReadingHistory>("ReadingHistory", ReadingHistorySchema);
