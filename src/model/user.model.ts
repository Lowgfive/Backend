import { Schema, model } from "mongoose";
import { UserType } from "../types/user.type";

const userSchema = new Schema<UserType>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    description : { type: String, default: ""},
    language: {
      type: String,
      enum: ["en", "vi"],
      default: "vi",
    },
    reading_history: { type: [String], default: [] },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<UserType>("User", userSchema);
