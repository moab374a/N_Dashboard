const { query, transaction } = require("../config/db");
const logger = require("../utils/logger");
const ErrorResponse = require("../utils/errorResponse");

// Get all tasks
exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    let queryText;
    let queryParams = [];

    if (isAdmin) {
      queryText = `
        SELECT t.*, p.project_name, 
        u.first_name as assignee_first_name, u.last_name as assignee_last_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.project_id
        LEFT JOIN users u ON t.assignee_id = u.user_id
        ORDER BY t.due_date ASC
      `;
    } else {
      queryText = `
        SELECT t.*, p.project_name, 
        u.first_name as assignee_first_name, u.last_name as assignee_last_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.project_id
        LEFT JOIN users u ON t.assignee_id = u.user_id
        WHERE t.assignee_id = $1 OR t.creator_id = $1
        ORDER BY t.due_date ASC
      `;
      queryParams.push(userId);
    }

    const result = await query(queryText, queryParams);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    logger.error(`Get tasks error: ${err.message}`);
    next(err);
  }
};

// Create new task
exports.createTask = async (req, res, next) => {
  try {
    const {
      projectId,
      title,
      description,
      startDate,
      dueDate,
      priority,
      assigneeId,
    } = req.body;

    if (!projectId || !title || !priority) {
      return next(new ErrorResponse("Please provide all required fields", 400));
    }

    const result = await query(
      `INSERT INTO tasks (
        project_id, title, description, start_date, due_date,
        status, priority, creator_id, assignee_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        projectId,
        title,
        description,
        startDate,
        dueDate,
        "To Do", // Default status
        priority,
        req.user.id, // Creator is current user
        assigneeId,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    logger.error(`Create task error: ${err.message}`);
    next(err);
  }
};
