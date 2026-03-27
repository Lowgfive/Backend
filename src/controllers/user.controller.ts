import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getUserProfileService } from "../services/user.service";
import { AppError } from "../utils/app-error";

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError(401, "AUTH_UNAUTHORIZED", "auth.unauthorized", "User not authenticated");
    }

    const userProfile = await getUserProfileService(userId);
    return res.status(200).json(userProfile);
};
