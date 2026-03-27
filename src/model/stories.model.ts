import mongoose, { Schema } from "mongoose";
import { IStory, IStoryLike } from "../types/stories.type";

export const STORY_GENRES = [
  "Fantasy",
  "Romance",
  "Action",
  "Adventure",
  "Mystery",
  "Historical",
  "Slice of Life",
  "Urban",
  "Martial Arts",
  "Cultivation",
  "Boys Love",
  "Girls Love",
] as const;

const LEGACY_STORY_TYPES = [
  "Huyền Huyễn",
  "Tu Tiên",
  "Đam Mỹ",
  "Bách Hợp",
  "Đô Thị",
  "Dị Năng",
  "Xuyên Không",
  "Cẩu Đạo",
  "Đời Thường",
  "Lịch Sử",
  "Võng Du",
];

const STORY_TYPE_OPTIONS = [...new Set([...LEGACY_STORY_TYPES, ...STORY_GENRES])];

const storySchema = new Schema<IStory>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    type: {
      type: String,
      enum: STORY_TYPE_OPTIONS,
      required: true,
    },
    title: { type: String, trim: true, default: "" },
    author: { type: String, trim: true, default: "" },
    coverImageUrl: { type: String, trim: true, default: "" },
    genres: {
      type: [String],
      enum: STORY_GENRES,
      default: [],
    },
    description: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Ongoing", "Completed"],
      default: "Ongoing",
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storySchema.index({ title: 1 });
storySchema.index({ genres: 1 });

const storyLikeSchema = new Schema<IStoryLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storyLikeSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export const StoryLike = mongoose.model<IStoryLike>(
  "StoryLike",
  storyLikeSchema
);

export const Story = mongoose.model<IStory>("Story", storySchema);
