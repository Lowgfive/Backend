import { Request, Response } from "express";
import { getMessagesByRoom } from "../services/chat.service";

export const getMessages = async (req: Request, res: Response) => {
  const { roomId } = (req as any).params;
  const messages = await getMessagesByRoom(roomId);

  res.status(200).json({
    message: "Messages fetched successfully",
    data: messages,
  });
};
