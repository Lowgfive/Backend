import { Request, Response, NextFunction } from "express";
import { registerService, loginService, getUserProfileService } from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const user = await registerService(req.body);
  res.status(201).json(user);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const result = await loginService(req.body.email, req.body.password);
  res.status(200).json(result);
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  // middleware authenticate nên đã gán req.user
  const userId = (req as any).user.id;

  const user = await getUserProfileService(userId);

  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  res.status(200).json({
    message: "Lấy thông tin profile thành công",
    user
  });
};