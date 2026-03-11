import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.middleware";

export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    // If no token, just proceed without setting req.user
    return next();
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
    // If token is invalid, we can either reject or treat as guest.
    // Usually, treating as guest is safer for optional auth, or we can just proceed without user info.
    next();
  }
};
