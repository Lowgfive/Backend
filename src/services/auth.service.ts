import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserType } from "../types/user.type";
import { User } from "../model/user.model";

export const registerService = async (data: UserType) => {
  const { email, password, username } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
  });

  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user, token };
};