import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "../utils/app-error";

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new AppError(403, "ADMIN_REQUIRED", "auth.adminRequired", "Admin access required")
    );
  }

  next();
};
