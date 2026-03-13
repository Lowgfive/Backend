import { Schema, model } from "mongoose";
import { IMoney } from "../types/money.type";

const MoneySchema = new Schema<IMoney>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      default: 1000
    }
  },
  { timestamps: true }
);

export const Money = model<IMoney>("Money", MoneySchema);