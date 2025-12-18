import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";

import { AppDataSource } from "./data-source";
import { ErrorHandler } from "./middlewares/error.middleware";
import authRouter from "./routes/Auth.routes";
import userRouter from "./routes/User.routes";
import taskRouter from "./routes/Task.routes";
import notificationRouter from "./routes/Notification.routes";
import dashboardRouter from "./routes/Dashboard.routes";

import { initSocket } from "./socket";

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

AppDataSource.initialize()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB error:", err));

app.get("/ping", (_, res) => {
  res.json({ success: true, message: "pong" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use(ErrorHandler);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
