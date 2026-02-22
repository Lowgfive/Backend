import { Schema, model } from "mongoose";
import { UserType } from "../types/user.type";

const userSchema = new Schema<UserType>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<UserType>("User", userSchema);