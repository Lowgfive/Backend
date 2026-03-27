import { Response } from "express";

type SuccessResponseInput = {
  code: string;
  messageKey: string;
  data?: unknown;
  [key: string]: unknown;
};

export const sendSuccess = (
  res: Response,
  status: number,
  payload: SuccessResponseInput
) => {
  const { code, messageKey, data, ...rest } = payload;

  return res.status(status).json({
    success: true,
    code,
    messageKey,
    ...(data !== undefined ? { data } : {}),
    ...rest,
  });
};
