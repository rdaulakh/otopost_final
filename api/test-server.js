require("dotenv").config({ path: "/home/ubuntu/ai-social-media-platform/api/.env" });
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error("Mongoose connection error:", err);
    process.exit(1);
  }
};

// Mongoose connection events
mongoose.connection.on("connecting", () => {
  console.log("Mongoose: connecting...");
});
mongoose.connection.on("connected", () => {
  console.log("Mongoose: connected.");
});
mongoose.connection.on("open", () => {
  console.log("Mongoose: connection open.");
});
mongoose.connection.on("disconnecting", () => {
  console.log("Mongoose: disconnecting...");
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose: disconnected.");
});
mongoose.connection.on("close", () => {
  console.log("Mongoose: connection closed.");
});
mongoose.connection.on("reconnected", () => {
  console.log("Mongoose: reconnected.");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

connectDB();

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const PORT = 5001;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
