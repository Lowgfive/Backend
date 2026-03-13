import { NextFunction, Request, Response } from "express";
import { Chapter } from "../model/chapter.model";
import { Money } from "../model/money.model";
import { Transaction } from "../model/transaction.model";
import mongoose from "mongoose";
import { UnlockedChapter } from "../model/unlockChapter.model";
const BASE_PRICE = 50;


    export const unlockChapterController = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { chapterId, storyId } = req.body;
    const userId = (req as any).user?.id;

    // đảm bảo có ví
    await Money.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, balance: 0 } },
      { upsert: true }
    );

    // kiểm tra đã unlock chưa
    const existed = await UnlockedChapter.findOne({
      userId,
      chapterId
    });

    if (existed) {
      return res.status(400).json({
        message: "Chapter already unlocked"
      });
    }

    // trừ tiền atomic
    const wallet = await Money.findOneAndUpdate(
      { userId, balance: { $gte: BASE_PRICE } },
      { $inc: { balance: -BASE_PRICE } },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({
        message: "Not enough balance"
      });
    }

    try {

      // lưu unlock
      await UnlockedChapter.create({
        userId,
        storyId,
        chapterId
      });

    } catch (err) {

      // rollback tiền nếu unlock lỗi
      await Money.updateOne(
        { userId },
        { $inc: { balance: BASE_PRICE } }
      );

      throw err;
    }

    await Transaction.create({
      userId,
      amount: BASE_PRICE,
      type: "spend",
      source: "unlock_chapter",
      storyId,
      chapterId
    });

    res.json({
      message: "Unlock success"
    });

  } catch (err) {
    next(err);
  }
};

export const getBalanceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const money = await Money.findOne({ userId });

    if (!money) {
      const newMoney = await Money.create({ userId, balance: 1000 });
      return res.json({ balance: newMoney.balance });
    }

    res.json({ balance: money.balance });
  } catch (err) {
    next(err);
  }
};

