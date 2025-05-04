const logger = require("./utils/logger");
const jwt = require("jsonwebtoken");
const { query } = require("./config/db");

module.exports = (io) => {
  // Authentication middleware for socket.io
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user exists
      const userResult = await query(
        "SELECT user_id, username FROM users WHERE user_id = $1 AND is_active = true",
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return next(new Error("Authentication error: User not found"));
      }

      // Store user info in socket
      socket.user = {
        id: userResult.rows[0].user_id,
        username: userResult.rows[0].username,
      };

      next();
    } catch (err) {
      logger.error(`Socket authentication error: ${err.message}`);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(
      `Socket connected: ${socket.id} - User: ${socket.user.username}`
    );

    // Join user to their personal room
    socket.join(`user:${socket.user.id}`);

    // Handle project room joining
    socket.on("join-project", async (projectId) => {
      try {
        // Check if user has access to project
        const projectResult = await query(
          `SELECT 1 FROM projects p
           WHERE p.project_id = $1 AND (
             p.owner_id = $2
             OR EXISTS (
               SELECT 1 FROM project_members pm
               WHERE pm.project_id = p.project_id AND pm.user_id = $2
             )
           )`,
          [projectId, socket.user.id]
        );

        if (projectResult.rows.length === 0) {
          socket.emit("error", { message: "Access denied to project" });
          return;
        }

        socket.join(`project:${projectId}`);
        logger.info(
          `User ${socket.user.username} joined project room: ${projectId}`
        );
      } catch (err) {
        logger.error(`Error joining project room: ${err.message}`);
        socket.emit("error", { message: "Failed to join project room" });
      }
    });

    // Handle chat room joining
    socket.on("join-chat", async (channelId) => {
      try {
        // Check if user has access to channel
        const channelResult = await query(
          `SELECT 1 FROM channel_members
           WHERE channel_id = $1 AND user_id = $2`,
          [channelId, socket.user.id]
        );

        if (channelResult.rows.length === 0) {
          socket.emit("error", { message: "Access denied to chat channel" });
          return;
        }

        socket.join(`chat:${channelId}`);
        logger.info(
          `User ${socket.user.username} joined chat room: ${channelId}`
        );
      } catch (err) {
        logger.error(`Error joining chat room: ${err.message}`);
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    // Handle sending messages
    socket.on("send-message", async (data) => {
      try {
        const { channelId, message } = data;

        // Insert message to database
        const result = await query(
          `INSERT INTO messages (channel_id, sender_id, message_text)
           VALUES ($1, $2, $3)
           RETURNING message_id, channel_id, sender_id, message_text, sent_at`,
          [channelId, socket.user.id, message]
        );

        const newMessage = result.rows[0];

        // Broadcast to channel
        io.to(`chat:${channelId}`).emit("new-message", {
          ...newMessage,
          sender_username: socket.user.username,
        });

        logger.info(
          `Message sent by ${socket.user.username} to channel: ${channelId}`
        );
      } catch (err) {
        logger.error(`Error sending message: ${err.message}`);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle task updates
    socket.on("task-update", async (data) => {
      try {
        const { projectId, taskId, status } = data;

        // Broadcast to project room
        io.to(`project:${projectId}`).emit("task-updated", {
          taskId,
          status,
          updatedBy: socket.user.id,
          updatedByUsername: socket.user.username,
        });

        logger.info(`Task ${taskId} updated by ${socket.user.username}`);
      } catch (err) {
        logger.error(`Error updating task: ${err.message}`);
        socket.emit("error", { message: "Failed to broadcast task update" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(
        `Socket disconnected: ${socket.id} - User: ${socket.user.username}`
      );
    });
  });
};
