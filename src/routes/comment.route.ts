import { Router } from "express";
import {
  createCommentController,
  getCommentsByChapterId,
} from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const commentRoute = Router();

commentRoute.get("/comments", asyncHandler(getCommentsByChapterId));
commentRoute.post("/comments", authenticate, asyncHandler(createCommentController));


export default commentRoute;
