// app.js - Express application setup

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");

// Load environment variables
require("dotenv").config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(xss()); // Sanitize input
app.use(hpp()); // Prevent HTTP parameter pollution

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
// app.use("/api/teams", require("./routes/teamRoutes"));
// app.use("/api/documents", require("./routes/documentRoutes"));
// app.use("/api/chat", require("./routes/chatRoutes"));
// app.use("/api/reports", require("./routes/reportRoutes"));
// app.use("/api/notifications", require("./routes/notificationRoutes"));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "Server is running" });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
