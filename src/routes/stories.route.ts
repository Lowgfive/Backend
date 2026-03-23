import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { createStory, getHomeStories, getlikeStory, toggleLike, getStories, checkLike, getStoryById } from "../controllers/stories.controller";
import { asyncHandler } from "../middlewares/asyncHandler";

const storyRoute = Router();

// Get home stories
storyRoute.get("/home", asyncHandler(getHomeStories));

// Search & filter
storyRoute.get("/", asyncHandler(getStories));

// Toggle like
storyRoute.post("/like", authenticate, asyncHandler(toggleLike));

storyRoute.get("/check-like/:storyId", authenticate, asyncHandler(checkLike));

storyRoute.get("/getLikeStory", authenticate, asyncHandler(getlikeStory));

storyRoute.post("/create", authenticate , asyncHandler(createStory));

// Get story detail by id
storyRoute.get("/:id", asyncHandler(getStoryById));
export default storyRoute;