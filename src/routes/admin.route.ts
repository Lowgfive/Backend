import { Router } from "express";
import { createStory, getDashboardStats, getStories, softDeleteStory, updateStory } from "../controllers/admin.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const adminRoute = Router();

adminRoute.use(authenticate, adminMiddleware);

adminRoute.get("/dashboard", asyncHandler(getDashboardStats));
adminRoute.get("/stories", asyncHandler(getStories));
adminRoute.post("/stories", asyncHandler(createStory));
adminRoute.put("/stories/:id", asyncHandler(updateStory));
adminRoute.delete("/stories/:id", asyncHandler(softDeleteStory));

export default adminRoute;
