import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoute from "./routes/auth.route";
import storyRoute from "./routes/stories.route";
import { connectRedis, redisClient } from "./config/redis";

dotenv.config();

const app = express();

connectDB();
connectRedis();
// Middleware
app.use(cors()); // ✅ bật CORS
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);

app.use("/api/stories", storyRoute);


app.get("/redis-test", async (req, res) => {
  await redisClient.set("test", "hello redis");
  const value = await redisClient.get("test");
  res.json({ value });
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("=================================");
});