import { Schema, model } from "mongoose";
import { ChatType } from "../types/chat.type";

const chatSchema = new Schema<ChatType>(
  {
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Chat = model<ChatType>("Chat", chatSchema);
