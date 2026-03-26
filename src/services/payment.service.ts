import crypto from "crypto";
import { Money } from "../model/money.model";
import { Transaction } from "../model/transaction.model";

const VND_PER_STONE_BLOCK = 1000;
const STONES_PER_BLOCK = 10;

type TopupPackage = {
  amount: number;
  label: string;
  stones: number;
};

type CreatePaymentInput = {
  userId: string;
  amount: number;
  ipAddr: string;
};

type VnpayReturnResult = {
  success: boolean;
  code: string;
  message: string;
  amount: number;
  stones: number;
  paymentRef: string;
  balance?: number;
  alreadyProcessed?: boolean;
};

const presetAmounts = [100000, 200000, 500000];

const getEnvConfig = () => ({
  tmnCode: process.env.VNP_TMN_CODE || "FZIOHE8K",
  hashSecret: process.env.VNP_HASH_SECRET || "U52PPWT4Y9ZWKQ4HASZHQGWIL5ATJZJS",
  vnpUrl: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl:
    process.env.VNP_RETURN_URL || "http://localhost:4000/api/v1/payments/vnpay_return",
  frontendReturnUrl:
    process.env.VNP_FRONTEND_RETURN_URL || "appreading://topup",
});

const pad = (value: number) => value.toString().padStart(2, "0");

const formatVnpDate = (date: Date) => {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
};

const sortObject = (input: Record<string, string>) => {
  return Object.keys(input)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = input[key];
      return acc;
    }, {});
};

const buildSignedQuery = (params: Record<string, string>, hashSecret: string) => {
  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString();
  const secureHash = crypto
    .createHmac("sha512", hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return {
    sortedParams,
    signData,
    secureHash,
  };
};

export const getTopupPackages = (): TopupPackage[] => {
  return presetAmounts.map((amount) => ({
    amount,
    label: `${amount.toLocaleString("vi-VN")} VND`,
    stones: convertAmountToStones(amount),
  }));
};

export const convertAmountToStones = (amount: number) => {
  return Math.floor(amount / VND_PER_STONE_BLOCK) * STONES_PER_BLOCK;
};

export const validateTopupAmount = (amount: number) => {
  if (!Number.isFinite(amount) || amount < VND_PER_STONE_BLOCK) {
    return {
      valid: false,
      message: "So tien nap toi thieu la 1,000 VND.",
    };
  }

  if (amount % VND_PER_STONE_BLOCK !== 0) {
    return {
      valid: false,
      message: "So tien nap phai chia het cho 1,000 VND.",
    };
  }

  return { valid: true, message: "" };
};

export const createVnpayPaymentUrl = ({ userId, amount, ipAddr }: CreatePaymentInput) => {
  const { tmnCode, hashSecret, vnpUrl, returnUrl } = getEnvConfig();
  const now = new Date();
  const createDate = formatVnpDate(now);
  const expireDate = formatVnpDate(new Date(now.getTime() + 15 * 60 * 1000));
  const paymentRef = `${userId.slice(-6)}_${Date.now()}`;
  const orderInfo = `TOPUP_${userId}_${amount}`;

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: paymentRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: String(amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const { sortedParams, secureHash } = buildSignedQuery(params, hashSecret);
  const query = new URLSearchParams({
    ...sortedParams,
    vnp_SecureHash: secureHash,
  }).toString();

  return {
    paymentUrl: `${vnpUrl}?${query}`,
    paymentRef,
    stones: convertAmountToStones(amount),
  };
};

export const handleVnpayReturn = async (
  query: Record<string, string | string[] | undefined>
): Promise<VnpayReturnResult> => {
  const { hashSecret } = getEnvConfig();
  const rawParams: Record<string, string> = {};

  Object.keys(query).forEach((key) => {
    const value = query[key];
    if (Array.isArray(value)) {
      rawParams[key] = value[0] || "";
      return;
    }

    if (typeof value === "string") {
      rawParams[key] = value;
    }
  });

  const secureHash = rawParams.vnp_SecureHash || "";
  delete rawParams.vnp_SecureHash;
  delete rawParams.vnp_SecureHashType;

  const { secureHash: expectedHash } = buildSignedQuery(rawParams, hashSecret);
  const responseCode = rawParams.vnp_ResponseCode || "";
  const paymentRef = rawParams.vnp_TxnRef || "";
  const amount = Number(rawParams.vnp_Amount || 0) / 100;
  const stones = convertAmountToStones(amount);
  const orderInfo = rawParams.vnp_OrderInfo || "";
  const userId = orderInfo.split("_")[1] || "";

  if (!secureHash || secureHash !== expectedHash) {
    return {
      success: false,
      code: "97",
      message: "Chu ky khong hop le.",
      amount,
      stones,
      paymentRef,
    };
  }

  if (responseCode !== "00") {
    return {
      success: false,
      code: responseCode || "99",
      message: "Thanh toan that bai hoac bi huy.",
      amount,
      stones,
      paymentRef,
    };
  }

  if (!userId) {
    return {
      success: false,
      code: "99",
      message: "Khong xac dinh duoc nguoi dung cua giao dich.",
      amount,
      stones,
      paymentRef,
    };
  }

  const existed = await Transaction.findOne({
    paymentRef,
    provider: "vnpay",
    source: "topup",
  });

  if (existed) {
    const wallet = await Money.findOne({ userId });

    return {
      success: true,
      code: responseCode,
      message: "Giao dich da duoc xu ly truoc do.",
      amount,
      stones,
      paymentRef,
      balance: wallet?.balance,
      alreadyProcessed: true,
    };
  }

  await Money.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balance: 1000 } },
    { upsert: true }
  );

  const wallet = await Money.findOneAndUpdate(
    { userId },
    { $inc: { balance: stones } },
    { new: true }
  );

  await Transaction.create({
    userId,
    amount: stones,
    type: "earn",
    source: "topup",
    provider: "vnpay",
    paymentRef,
    metadata: {
      amountVnd: amount,
      gatewayResponseCode: responseCode,
      rawParams,
    },
  });

  console.log(
    `[VNPay Sandbox] Top up success user=${userId} amountVnd=${amount} stones=${stones} paymentRef=${paymentRef}`
  );

  return {
    success: true,
    code: responseCode,
    message: "Nap tien thanh cong.",
    amount,
    stones,
    paymentRef,
    balance: wallet?.balance,
  };
};

export const buildTopupReturnHtml = (result: VnpayReturnResult) => {
  const { frontendReturnUrl } = getEnvConfig();
  const redirectUrl = `${frontendReturnUrl}?status=${result.success ? "success" : "failed"}&message=${encodeURIComponent(
    result.message
  )}&stones=${result.stones}&amount=${result.amount}&paymentRef=${encodeURIComponent(
    result.paymentRef
  )}&balance=${result.balance || ""}`;

  const title = result.success ? "Thanh toan thanh cong" : "Thanh toan that bai";
  const description = result.success
    ? `Da cong ${result.stones} Stone vao vi.`
    : "Giao dich khong hop le hoac chua thanh cong.";

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #101418; color: #f7f7f7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { width: min(92vw, 420px); background: #1b232b; border-radius: 20px; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,.25); }
    .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: ${result.success ? "#224b32" : "#5a2121"}; color: #fff; font-size: 12px; }
    h1 { margin: 16px 0 10px; font-size: 24px; }
    p { color: #c7d0d8; line-height: 1.6; }
    a { display: inline-block; margin-top: 18px; color: #111; background: #e08a2a; text-decoration: none; font-weight: 700; padding: 12px 18px; border-radius: 12px; }
  </style>
  <script>
    setTimeout(function () { window.location.href = "${redirectUrl}"; }, 1200);
  </script>
</head>
<body>
  <div class="card">
    <span class="badge">${result.success ? "SUCCESS" : "FAILED"}</span>
    <h1>${title}</h1>
    <p>${description}</p>
    <p>Ma giao dich: ${result.paymentRef || "N/A"}</p>
    <a href="${redirectUrl}">Quay lai ung dung</a>
  </div>
</body>
</html>`;
};
