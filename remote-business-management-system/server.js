// server.js - Entry point for the application

const app = require("./app");
const http = require("http");
const socketIo = require("socket.io");
const { connectDB } = require("./config/db");
const logger = require("./utils/logger");

// Environment variables
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO for real-time communication
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handling
require("./sockets")(io);

// Start the server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server; // Export for testing
