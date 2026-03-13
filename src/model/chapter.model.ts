import mongoose, { Schema, model } from "mongoose";
import { ChapterType } from "../types/chapter.type";

const chapterSchema = new Schema<ChapterType>(
    {
        storyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Story" },
        chapterNumber: { type: Number, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        isPay: {type : Boolean, default : false}
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Tạo Database Index để cải thiện tốc độ lookup
// storyId kết hợp với chapterNumber giúp load page và check prefetch cực nhanh
chapterSchema.index({ storyId: 1, chapterNumber: 1 });

export const Chapter = model<ChapterType>("Chapter", chapterSchema);
