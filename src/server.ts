import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoute from "./routes/auth.route";
import storyRoute from "./routes/stories.route";
import userRoute from "./routes/user.route";
import chaptersRoute from "./routes/chapters.route";
import readingHistoryRoute from "./routes/readingHistory.route";

import { connectRedis, redisClient } from "./config/redis";
import commentRoute from "./routes/comment.route";

dotenv.config();

const app = express();

connectDB();
connectRedis();
// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));


app.use("/api", commentRoute);
app.use("/api/auth", authRoute);

app.use("/api/stories", storyRoute);

app.use("/api/user", userRoute);

app.use("/api/chapters", chaptersRoute);

import moneyRoute from "./routes/money.route";

app.use("/api/reading-history", readingHistoryRoute);

app.use("/api/money", moneyRoute);

app.get("/redis-test", async (req, res) => {
  await redisClient.set("test", "hello redis");
  const value = await redisClient.get("test");
  res.json({ value });
});

// error handling middleware should be registered after all routes
import { errorHandler } from "./middlewares/error.middleware";
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("=================================");
});