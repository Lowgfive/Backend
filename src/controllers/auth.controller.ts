import { Request, Response, NextFunction } from "express";
import { 
  registerService, 
  loginService, 
  getUserProfileService, 
  updateProfileService, 
  updateAvatarService, 
  updatePasswordService 
} from "../services/auth.service";

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

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { username, description, email } = req.body;

    const user = await updateProfileService(userId, username, description, email);

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "URL avatar là bắt buộc"
      });
    }

    const user = await updateAvatarService(userId, avatar);

    res.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công",
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mật khẩu cũ và mới"
      });
    }

    await updatePasswordService(userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
      data: null
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};