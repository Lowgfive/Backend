import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return next(
      new AppError(401, "AUTH_TOKEN_MISSING", "auth.tokenMissing", "No token provided")
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decoded;
    next();
  } catch {
    next(
      new AppError(401, "AUTH_TOKEN_INVALID", "auth.tokenInvalid", "Invalid token")
    );
  }
};

export const authMiddleware = authenticate;
