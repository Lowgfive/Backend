import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: { 
      type: String, 
      required: true 
    },

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
    votes : {
        type : Number,
        default : 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Comment = model("Comment", commentSchema);