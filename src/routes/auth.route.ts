import { Router } from "express";
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  updateAvatar, 
  updatePassword 
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const authRoute = Router();

authRoute.post("/register", asyncHandler(register));
authRoute.post("/login", asyncHandler(login));

authRoute.get("/profile", authenticate, asyncHandler(getProfile));
authRoute.put("/profile", authenticate, asyncHandler(updateProfile));
authRoute.put("/avatar", authenticate, asyncHandler(updateAvatar));
authRoute.put("/password", authenticate, asyncHandler(updatePassword));

export default authRoute;