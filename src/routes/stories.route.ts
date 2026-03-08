import { Router } from "express";

import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware";
import { createStory, getHomeStories, toggleLike } from "../controllers/stories.controller";

const storyRoute = Router();

// Get home stories
storyRoute.get("/home", getHomeStories);

// Toggle like
storyRoute.post("/like", authenticate, toggleLike);


storyRoute.post("/create", authenticate , createStory)
export default storyRoute;