import { Chat } from "../model/chat.model";
import { ChatType } from "../types/chat.type";

export const createMessage = async (data: ChatType) => {
  const message = await Chat.create(data);
  return message;
};

export const getMessagesByRoom = async (roomId: string) => {
  const messages = await Chat.find({ roomId })
    .populate("userId", "username avatar")
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

  return messages;
};
