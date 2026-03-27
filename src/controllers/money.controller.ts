import { NextFunction, Request, Response } from "express";
import { Money } from "../model/money.model";
import { Transaction } from "../model/transaction.model";
import { UnlockedChapter } from "../model/unlockChapter.model";
import { redisClient } from "../config/redis";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/api-response";

const BASE_PRICE = 50;

export const unlockChapterController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId, storyId } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId || !chapterId || !storyId) {
      throw new AppError(400, "UNLOCK_REQUIRED_FIELDS", "chapterUnlock.requiredFields", "Missing required parameters");
    }

    await Money.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, balance: 1000 } },
      { upsert: true }
    );

    const existed = await UnlockedChapter.findOne({
      userId,
      chapterId
    });

    if (existed) {
      throw new AppError(400, "CHAPTER_ALREADY_UNLOCKED", "chapterUnlock.alreadyUnlocked", "Chapter already unlocked");
    }

    const currentMoney = await Money.findOne({ userId });
    console.log(`[UnlockChapter] Current balance: ${currentMoney?.balance}`);

    if (!currentMoney || currentMoney.balance < BASE_PRICE) {
      console.log(`[UnlockChapter] Not enough balance: ${currentMoney?.balance} < ${BASE_PRICE}`);
      throw new AppError(400, "BALANCE_INSUFFICIENT", "wallet.insufficientBalance", "Not enough balance to unlock chapter");
    }

    const wallet = await Money.findOneAndUpdate(
      { userId, balance: { $gte: BASE_PRICE } },
      { $inc: { balance: -BASE_PRICE } },
      { new: true }
    );

    if (!wallet) {
      throw new AppError(400, "BALANCE_INSUFFICIENT", "wallet.insufficientBalance", "Not enough balance to unlock chapter");
    }

    try {
      await UnlockedChapter.create({
        userId,
        storyId,
        chapterId
      });
    } catch (err) {
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

    const keyChapter = `listChapters:${storyId}:${userId}`;
    await redisClient.del(keyChapter);

    return sendSuccess(res, 200, {
      code: "CHAPTER_UNLOCK_SUCCESS",
      messageKey: "chapterUnlock.success",
    });
  } catch (err) {
    console.error(`[UnlockChapter] Uncaught Error:`, err);
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
