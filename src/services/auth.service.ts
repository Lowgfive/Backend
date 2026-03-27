import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserType } from "../types/user.type";
import { User } from "../model/user.model";
import { Money } from "../model/money.model";
import { AppError } from "../utils/app-error";

export const registerService = async (data: UserType) => {
  const { email, password, username, role = "user", language = "vi" } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "AUTH_EMAIL_EXISTS", "auth.emailExists", "Email already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
    role,
    language,
  });

  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, "AUTH_EMAIL_NOT_FOUND", "auth.emailNotFound", "Email does not exist");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(401, "AUTH_PASSWORD_INVALID", "auth.passwordInvalid", "Password is incorrect");
  }

  await Money.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, balance: 1000 } },
    { upsert: true }
  );

  const token = jwt.sign(
    { id: user._id, role: user.role || "user" },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user, token };
};

export const getUserProfileService = async (userId: string): Promise<UserType | null> => {
  return await User.findById(userId).select("-password");
};

export const updateProfileService = async (
  userId: string,
  username?: string,
  description?: string,
  email?: string,
  language?: "en" | "vi"
) => {
  const updateData: any = {};
  if (username) updateData.username = username;
  if (description !== undefined) updateData.description = description;
  if (email) updateData.email = email;
  if (language) updateData.language = language;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "user.notFound", "User not found");
  }

  return user;
};

export const updateAvatarService = async (userId: string, avatar: string) => {
  const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true }).select("-password");
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "user.notFound", "User not found");
  }

  return user;
};

export const updatePasswordService = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "user.notFound", "User not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(400, "AUTH_OLD_PASSWORD_INVALID", "auth.oldPasswordInvalid", "Current password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();

  return true;
};
