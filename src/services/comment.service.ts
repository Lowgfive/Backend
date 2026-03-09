import { Comment } from "../model/comment.model";
import { CommentType } from "../types/comment.type";

export const createCommentService = async (data: CommentType) => {
  const comment = await Comment.create(data);
  return comment;
};