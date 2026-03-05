import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getUserProfileService } from "../services/user.service";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id; // Assuming user.id comes from decoded JWT

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const userProfile = await getUserProfileService(userId);
    return res.status(200).json(userProfile);
};
