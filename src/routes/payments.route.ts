import { Router } from "express";
import {
  createVnpayPaymentController,
  getTopupPackagesController,
  vnpayReturnController,
} from "../controllers/payments.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/packages", getTopupPackagesController);
router.post("/vnpay/create-payment-url", authenticate, createVnpayPaymentController as any);
router.get("/vnpay_return", vnpayReturnController as any);

export default router;
