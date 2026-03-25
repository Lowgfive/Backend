import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Yêu cầu quyền quản trị viên" });
  }

  next();
};
