import { Request, Response } from "express";
import { getMessagesByRoom } from "../services/chat.service";
import { sendSuccess } from "../utils/api-response";

export const getMessages = async (req: Request, res: Response) => {
  const { roomId } = (req as any).params;
  const messages = await getMessagesByRoom(roomId);

  return sendSuccess(res, 200, {
    code: "CHAT_MESSAGES_FETCH_SUCCESS",
    messageKey: "chat.messagesFetchSuccess",
    data: messages,
  });
};
