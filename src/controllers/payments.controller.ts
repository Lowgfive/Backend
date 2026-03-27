import { NextFunction, Request, Response } from "express";
import {
  buildTopupReturnHtml,
  createVnpayPaymentUrl,
  getTopupPackages,
  handleVnpayReturn,
  validateTopupAmount,
} from "../services/payment.service";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/api-response";

export const getTopupPackagesController = (_req: Request, res: Response) => {
  res.json({
    rate: "1,000 VND = 10 Stone",
    packages: getTopupPackages(),
  });
};

export const createVnpayPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const amount = Number(req.body?.amount);
    const validation = validateTopupAmount(amount);

    if (!userId) {
      throw new AppError(401, "AUTH_UNAUTHORIZED", "auth.unauthorized", "Unauthorized");
    }

    if (!validation.valid) {
      throw new AppError(400, validation.code, validation.messageKey, validation.message);
    }

    const forwardedFor = req.headers["x-forwarded-for"];
    const ipAddr =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]) ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const data = createVnpayPaymentUrl({
      userId,
      amount,
      ipAddr,
    });

    return sendSuccess(res, 200, {
      code: "PAYMENT_URL_CREATE_SUCCESS",
      messageKey: "payments.createUrlSuccess",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const vnpayReturnController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await handleVnpayReturn(req.query as any);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(buildTopupReturnHtml(result));
  } catch (err) {
    next(err);
  }
};
