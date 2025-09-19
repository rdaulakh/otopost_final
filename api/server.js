require("dotenv").config({ path: "/home/ubuntu/ai-social-media-platform/api/.env" });
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
// const { errorAuditMiddleware } = require("./middleware/auditLogger"); // Disabled for development
const session = require("express-session");
const initializeSocketService = require("./services/socketService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-strong-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.get("/api/health", (req, res) => res.status(200).send("OK"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/content", require("./routes/content"));
app.use("/api/social-profiles", require("./routes/socialProfiles"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/media", require("./routes/media"));
app.use("/api/realtime", require("./routes/realtime"));
app.use("/api/security", require("./routes/security"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/monitoring", require("./routes/monitoring"));
app.use("/api/customer-analytics", require("./routes/customerAnalytics"));
app.use("/api/ai-strategy", require("./routes/aiStrategy"));
app.use("/api/campaigns", require("./routes/campaigns"));
app.use("/api/boosts", require("./routes/boosts"));
app.use("/api/ai-content", require("./routes/aiContent"));
app.use("/api/social-publishing", require("./routes/socialPublishing"));
app.use("/api/twitter-auth", require("./routes/twitterAuth"));
app.use("/api/ai-agents", require("./routes/aiAgents"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/media-library", require("./routes/mediaLibrary"));

// Error handling middleware
// app.use(errorAuditMiddleware); // Disabled for development

// Socket.IO
initializeSocketService(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
