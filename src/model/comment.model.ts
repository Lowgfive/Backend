import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.index({ chapterId: 1, createdAt: -1 });

export const Comment = model("Comment", commentSchema);
