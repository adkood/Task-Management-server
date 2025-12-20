import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // authentication middleware
  io.use(async (socket, next) => {
    console.log('Socket connection attempt');
    console.log('Cookies:', socket.handshake.headers.cookie);
    console.log('Auth:', socket.handshake.auth);

    const cookies = socket.handshake.headers.cookie || '';
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    console.log('Extracted token:', token ? '***' : 'null');

    if (!token) {
      console.log('Socket rejected: No token in cookies');
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.userId = decoded.id;
      socket.data.username = decoded.username;
      console.log(`Socket authenticated for user: ${decoded.username}`);
      next();
    } catch (error) {
      console.log('Socket rejected: Invalid token');
      next(new Error('Invalid token'));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    socket.join(`user:${userId}`);

    socket.join("all-tasks");

    console.log(`User ${userId} connected to socket`);

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });

  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};