import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const authRoute = Router();

authRoute.post("/register", asyncHandler(register));
authRoute.post("/login", asyncHandler(login));
authRoute.get("/profile", authenticate, asyncHandler(getProfile));
export default authRoute;