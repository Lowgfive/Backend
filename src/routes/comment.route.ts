import { Router } from "express";
import { createCommentController } from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const commentRoute = Router();

commentRoute.post("/comment", authenticate,createCommentController);

export default commentRoute;