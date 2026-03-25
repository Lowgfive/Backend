import { Router } from "express";
import { createStory, getDashboardStats } from "../controllers/admin.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const adminRoute = Router();

adminRoute.use(authenticate, adminMiddleware);

adminRoute.get("/dashboard", asyncHandler(getDashboardStats));
adminRoute.post("/stories", asyncHandler(createStory));

export default adminRoute;
