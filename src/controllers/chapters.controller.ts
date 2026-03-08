import { Request, Response } from "express";
import { CreateChapterService, getStoryChaptersListService, readChapterAndPreloadService } from "../services/chapters.service";

export const getStoryChaptersList = async (req: Request, res: Response) => {
    const storyId = req.params.storyId as string;

    if (!storyId) {
        return res.status(400).json({ message: "storyId is required" });
    }

    const list = await getStoryChaptersListService(storyId);
    res.status(200).json(list);
};

export const readChapter = async (req: Request, res: Response) => {
    const storyId = req.params.storyId as string;
    const chapterNumberStr = req.params.chapterNumber as string;
    if (!storyId || !chapterNumberStr) {
        return res.status(400).json({ message: "storyId and chapterNumber are required" });
    }

    const num = parseFloat(chapterNumberStr);
    if (isNaN(num)) {
        return res.status(400).json({ message: "Invalid chapterNumber" });
    }

    const chapter = await readChapterAndPreloadService(storyId, num);
    res.status(200).json(chapter);
};


export const CreateChapter = async (req : Request, res : Response) => {
    try {
    const {storyId , chapters} = req.body;
    const createC = await CreateChapterService(storyId, chapters)
    console.log(createC)
    if(createC) {
        return res.status(200).json({message : "Thêm Chapter Thành Công !"})
    }
    } catch (error : any) {
        console.log(error)
        res.status(500).json({message : error});
    }
}