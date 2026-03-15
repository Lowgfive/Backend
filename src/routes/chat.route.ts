import { Router } from "express";
import { getMessages } from "../controllers/chat.controller";
import { asyncHandler } from "../middlewares/asyncHandler";

const chatRoute = Router();

chatRoute.get("/:roomId", asyncHandler(getMessages));

export default chatRoute;
