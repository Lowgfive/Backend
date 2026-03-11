import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { createStory, getHomeStories, getlikeStory, toggleLike } from "../controllers/stories.controller";
import { asyncHandler } from "../middlewares/asyncHandler";

const storyRoute = Router();

// Get home stories
storyRoute.get("/home", asyncHandler(getHomeStories));

// Toggle like
storyRoute.post("/like", authenticate, asyncHandler(toggleLike));

storyRoute.get("/getLikeStory", authenticate, asyncHandler(getlikeStory));


storyRoute.post("/create", authenticate , asyncHandler(createStory))
export default storyRoute;