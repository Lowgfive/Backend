import { Request, Response, NextFunction } from "express";
import {
  registerService,
  loginService,
  getUserProfileService,
  updateProfileService,
  updateAvatarService,
  updatePasswordService
} from "../services/auth.service";
import { sendSuccess } from "../utils/api-response";
import { AppError } from "../utils/app-error";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const user = await registerService(req.body);
  return sendSuccess(res, 201, {
    code: "AUTH_REGISTER_SUCCESS",
    messageKey: "auth.registerSuccess",
    data: user,
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const result = await loginService(req.body.email, req.body.password);
  return sendSuccess(res, 200, {
    code: "AUTH_LOGIN_SUCCESS",
    messageKey: "auth.loginSuccess",
    data: result,
  });
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const user = await getUserProfileService(userId);

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "user.notFound", "User not found");
  }

  return sendSuccess(res, 200, {
    code: "AUTH_PROFILE_FETCH_SUCCESS",
    messageKey: "auth.profileFetchSuccess",
    user,
  });
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { username, description, email, language } = req.body;
  const user = await updateProfileService(userId, username, description, email, language);

  return sendSuccess(res, 200, {
    code: "AUTH_PROFILE_UPDATE_SUCCESS",
    messageKey: "auth.profileUpdateSuccess",
    data: user,
  });
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { avatar } = req.body;

  if (!avatar) {
    throw new AppError(400, "AUTH_AVATAR_REQUIRED", "auth.avatarRequired", "Avatar URL is required");
  }

  const user = await updateAvatarService(userId, avatar);

  return sendSuccess(res, 200, {
    code: "AUTH_AVATAR_UPDATE_SUCCESS",
    messageKey: "auth.avatarUpdateSuccess",
    data: user,
  });
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new AppError(400, "AUTH_PASSWORD_INPUT_REQUIRED", "auth.passwordInputRequired", "Old and new passwords are required");
  }

  await updatePasswordService(userId, oldPassword, newPassword);

  return sendSuccess(res, 200, {
    code: "AUTH_PASSWORD_UPDATE_SUCCESS",
    messageKey: "auth.passwordUpdateSuccess",
    data: null,
  });
};
