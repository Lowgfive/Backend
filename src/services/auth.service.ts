import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserType } from "../types/user.type";
import { User } from "../model/user.model";
import { Money } from "../model/money.model";

export const registerService = async (data: UserType) => {
  const { email, password, username, role = "user" } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
    role,
  });

  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại!");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Sai mật khẩu vui lòng nhập lại!");

  // Ensure money record exists
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

export const updateProfileService = async (userId: string, username?: string, description?: string, email?: string) => {
  const updateData: any = {};
  if (username) updateData.username = username;
  if (description !== undefined) updateData.description = description;
  if (email) updateData.email = email;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
  if (!user) throw new Error("Người dùng không tồn tại");

  return user;
};

export const updateAvatarService = async (userId: string, avatar: string) => {
  const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true }).select("-password");
  if (!user) throw new Error("Người dùng không tồn tại");

  return user;
};

export const updatePasswordService = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu cũ không đúng");

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();

  return true;
};
