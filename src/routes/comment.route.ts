import { Router } from "express";
import { createCommentController } from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const commentRoute = Router();

commentRoute.post("/comment", authenticate, asyncHandler(createCommentController));

export default commentRoute;