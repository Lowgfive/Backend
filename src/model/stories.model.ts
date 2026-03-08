import mongoose, { Document, Schema } from "mongoose";
import { IStory, IStoryLike } from "../types/stories.type";



const storySchema = new Schema<IStory>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    type: { type: String, enum : ["Huyền Huyễn", "Tu Tiên", "Đam Mỹ", "Bách Hợp", "Đô Thị", "Dị Năng", "Xuyên Không", "Cẩu Đạo"],  required: true },
    description: { type: String, required: true },
    userId : {
      type : mongoose.Schema.Types.ObjectId,
      require : true,
      ref : "User"
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
      default: "ACTIVE",
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    totalChapters : {
      type : Number,
      default : 0
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);




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

// tránh like trùng
storyLikeSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export const StoryLike = mongoose.model<IStoryLike>(
  "StoryLike",
  storyLikeSchema
);

export const Story = mongoose.model<IStory>("Story", storySchema);