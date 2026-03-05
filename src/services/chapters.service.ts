import { Chapter } from "../model/chapter.model";
import { redisClient } from "../config/redis";
import mongoose from "mongoose";
import { Story } from "../model/stories.model";

const CACHE_TTL = 3600; // 1 hour

// 1. API: Lấy Danh Mục Truyện (Loại bỏ content để tiết kiệm băng thông)
export const getStoryChaptersListService = async (storyId: string) => {
    const chapters = await Chapter.find({ storyId })
        .select("title chapterNumber -_id") // Bỏ _id và bỏ content
        .sort({ chapterNumber: 1 })
        .lean();

    return chapters;
};

// Hàm phụ: Helper để khởi chạy ngầm Background Prefetching
const triggerBackgroundPrefetching = async (storyId: string, currentChapterNumber: number) => {
    let after = currentChapterNumber + 1;
    let afterafter = currentChapterNumber + 2
    const key = `Chapter:storyId:${storyId}/chapterNumber:${after}` // key nên đồng bộ 
    const otherkey = `Chapter:storyId:${storyId}/chapterNumber:${afterafter}` // key nên đồng bộ 

    const [chapter1, chapter2] = await Promise.all([Chapter.findOne({ storyId: storyId, chapterNumber: after }), Chapter.findOne({ storyId: storyId, chapterNumber: afterafter })])

    if (chapter1) {
        await redisClient.set(key, JSON.stringify(chapter1), { EX: 600 })
    }
    if (chapter2) {
        await redisClient.set(otherkey, JSON.stringify(chapter2), { EX: 600 })
    }
};

// 2. Lấy 1 Chương và Tự Động Kích Hoạt Nạp Trước
export const readChapterAndPreloadService = async (storyId: string, chapterNumber: number, userId: string) => {
    const key = `Chapter:storyId:${storyId}/chapterNumber:${chapterNumber}`
    const viewCount = `View:storyId:${storyId}/chapterNumber:${chapterNumber}/userId:${userId}`
    const getView = await redisClient.get(viewCount)
    if (userId) {

        if (!getView) {
            await redisClient.set(viewCount, 1, { EX: 600 })
            const view = await redisClient.incr(storyId)
            console.log("view tai thoi diem nay " + view)
        }
        else {
            console.log("Khong tang")
        }
    }

    const cache = await redisClient.get(key)
    if (cache) {
        triggerBackgroundPrefetching(storyId, chapterNumber)
        return JSON.parse(cache)
    }

    const chapter = await Chapter.findOne({ storyId: storyId, chapterNumber: chapterNumber })

    await redisClient.set(key, JSON.stringify(chapter), { EX: 600 })

    triggerBackgroundPrefetching(storyId, chapterNumber)

    return chapter
};
