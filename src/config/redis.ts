import { createClient } from "redis";

// Docker sẽ truyền biến REDIS_URL vào, ví dụ: redis://redis:6379
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis connected");
    }
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
  }
};