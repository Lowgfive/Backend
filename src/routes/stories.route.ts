import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { toggleLike } from "../controllers/stories.controller";

const storyRoute = Router();

// Toggle like
storyRoute.post("/like", authenticate, toggleLike);

export default storyRoute;