import { Schema, model } from "mongoose";
import { ITransaction } from "../types/money.type";


const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["earn", "spend"],
      required: true
    },
    source: {
      type: String,
      enum: ["unlock_chapter", "topup", "event", "admin"],
      required: true
    },
    provider: {
      type: String,
      enum: ["vnpay"]
    },
    paymentRef: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: "Story"
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter"
    }
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
