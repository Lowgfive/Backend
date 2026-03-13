import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getBalanceController } from "../controllers/money.controller";

const router = Router();

router.get("/balance", authenticate, getBalanceController as any);

export default router;
