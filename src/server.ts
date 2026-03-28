import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db";
import authRoute from "./routes/auth.route";
import storyRoute from "./routes/stories.route";

import chaptersRoute from "./routes/chapters.route";
import readingHistoryRoute from "./routes/readingHistory.route";
import chatRoute from "./routes/chat.route";

import { connectRedis } from "./config/redis";
import commentRoute from "./routes/comment.route";
import moneyRoute from "./routes/money.route";
import { errorHandler } from "./middlewares/error.middleware";
import { createMessage } from "./services/chat.service";
import adminRoute from "./routes/admin.route";
import paymentsRoute from "./routes/payments.route";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

connectDB();
connectRedis();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", commentRoute);
app.use("/api/auth", authRoute);
app.use("/api/stories", storyRoute);

app.use("/api/chapters", chaptersRoute);
app.use("/api/reading-history", readingHistoryRoute);
app.use("/api/money", moneyRoute);
app.use("/api/chat", chatRoute);
app.use("/api/admin", adminRoute);
app.use("/api/v1/payments", paymentsRoute);

// error handling middleware should be registered after all routes
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 8080;

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id?: string;
      _id?: string;
      role?: string;
    };

    socket.data.user = {
      id: decoded.id || decoded._id,
      role: decoded.role || "user",
    };

    if (!socket.data.user.id) {
      return next(new Error("Invalid token payload"));
    }

    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_room", (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (payload: { content: string; roomId: string }) => {
    try {
      const { content, roomId } = payload;
      const userId = socket.data.user?.id as string | undefined;

      if (!content || !userId || !roomId) return;

      const message = await createMessage({ content, userId, roomId });
      const populated = await message.populate("userId", "username avatar");

      io.to(roomId).emit("receive_message", populated);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Bind all interfaces so devices on the LAN (e.g. Expo) can reach the container.
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("=================================");
});

