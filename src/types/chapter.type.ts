import { Types } from "mongoose";

export type ChapterType = {
    storyId: Types.ObjectId;
    chapterNumber: number;
    title: string;
    content: string;
    isPay : boolean
};

export type ChapterInput = {
    chapterNumber: number;
    title: string;
    content: string;
}