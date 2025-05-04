const { query, transaction } = require("../config/db");
const logger = require("../utils/logger");
const ErrorResponse = require("../utils/errorResponse");

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT user_id, username, email, first_name, last_name, 
       job_title, profile_image_url, created_at
       FROM users
       ORDER BY created_at DESC`,
      []
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    logger.error(`Get users error: ${err.message}`);
    next(err);
  }
};

// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT user_id, username, email, first_name, last_name, 
       job_title, profile_image_url, created_at
       FROM users
       WHERE user_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return next(
        new ErrorResponse(`User not found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    logger.error(`Get user error: ${err.message}`);
    next(err);
  }
};
