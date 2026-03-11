import { Chapter } from "../model/chapter.model";
import { redisClient } from "../config/redis";
import mongoose from "mongoose";
import { Story } from "../model/stories.model";
import { ChapterInput } from "../types/chapter.type";

const CACHE_TTL = 3600; // 1 hour

// 1. API: Lấy Danh Mục Truyện (Loại bỏ content để tiết kiệm băng thông)
export const getStoryChaptersListService = async (storyId: string) => {
    const chapters = await Chapter.find({ storyId })
        .select("title chapterNumber _id createdAt updatedAt") 
        .sort({ chapterNumber: 1 })
        .lean();

    return chapters;
};

// Hàm phụ: Helper để khởi chạy ngầm Background Prefetching
const triggerBackgroundPrefetching = async (storyId: string, currentChapterNumber: number) => {
    let after = currentChapterNumber + 1;
    let afterafter = currentChapterNumber + 2
    const key = `Chapter:${storyId}:${after}` // key nên đồng bộ 
    const otherkey = `Chapter:${storyId}:${afterafter}` // key nên đồng bộ 

    const [chapter1, chapter2] = await Promise.all([Chapter.findOne({ storyId: storyId, chapterNumber: after }), Chapter.findOne({ storyId: storyId, chapterNumber: afterafter })])

    if (chapter1) {
        await redisClient.set(key, JSON.stringify(chapter1), { EX: 600 })
    }
    if (chapter2) {
        await redisClient.set(otherkey, JSON.stringify(chapter2), { EX: 1200 })
    }
};

// 2. Lấy 1 Chương và Tự Động Kích Hoạt Nạp Trước
export const readChapterAndPreloadService = async (storyId: string, chapterNumber: number) => {
    const key = `Chapter:${storyId}:${chapterNumber}`
    const viewCount = `View${storyId}:${chapterNumber}`
    const newView =  await redisClient.set(viewCount, 1, { EX: 600 , NX : true})
    
        if (newView) {
            await Story.findByIdAndUpdate(storyId, { $inc : {viewCount : 1}})
        }

    const cache = await redisClient.get(key)
    if (cache) {
        console.log("cache hit in chapter number")
        triggerBackgroundPrefetching(storyId, chapterNumber)
        return JSON.parse(cache)
    }

    const chapter = await Chapter.findOne({ storyId: storyId, chapterNumber: chapterNumber })

    await redisClient.set(key, JSON.stringify(chapter), { EX: 600 })

    triggerBackgroundPrefetching(storyId, chapterNumber)

    return chapter
};

export const CreateChapterService = async (
    storyId : string, chapters : ChapterInput[]
) => {

    chapters.map(ch => console.log("chapterNum "+ch.chapterNumber + " title " + ch.title + " content " + ch.content))
    const insertChapter = await Chapter.insertMany(
        chapters.map(ch => ({
            storyId : storyId,
            chapterNumber : ch.chapterNumber,
            title : ch.title,
            content : ch.content
        }
        ))
    )

    await Story.findByIdAndUpdate(storyId, { $inc : {
        totalChapters : insertChapter.length
    }})

    return insertChapter;
}
