import { Types } from "mongoose";
import { Comment } from "../model/comment.model";
import { CommentResponseType, CommentType } from "../types/comment.type";

const mapCommentToResponse = (comment: any): CommentResponseType => ({
  id: comment._id.toString(),
  content: comment.content,
  userName: comment.userId?.username || "Unknown User",
  avatar: comment.userId?.avatar || "",
  createdAt: comment.createdAt,
});

export const createCommentService = async (
  data: CommentType
): Promise<CommentResponseType> => {
  const comment = await Comment.create(data);
  const populatedComment = await comment.populate("userId", "username avatar");
  return mapCommentToResponse(populatedComment);
};

export const getCommentsByChapterIdService = async (
  chapterId: string
): Promise<CommentResponseType[]> => {
  if (!Types.ObjectId.isValid(chapterId)) {
    return [];
  }

  const comments = await Comment.find({
    chapterId: new Types.ObjectId(chapterId),
  })
    .populate("userId", "username avatar")
    .sort({ createdAt: -1 })
    .lean();

  return comments.map(mapCommentToResponse);
};
