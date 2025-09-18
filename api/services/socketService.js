const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const User = require("../models/User");

module.exports = function(io) {
  const connectedUsers = new Map();
  const userSockets = new Map();

  let redis;
  try {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    console.log("Redis connected for Socket.IO");
  } catch (error) {
    console.error("Redis connection error:", error);
  }

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return next(new Error("Authentication token required"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.name} connected (${socket.id})`);
    connectedUsers.set(socket.userId, socket.id);
    userSockets.set(socket.id, { userId: socket.userId, user: socket.user });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.name} disconnected (${socket.id})`);
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.id);
    });
  });

  console.log("Socket.IO service initialized");
};
