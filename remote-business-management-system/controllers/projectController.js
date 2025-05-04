const { query, transaction } = require("../config/db");
const logger = require("../utils/logger");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @desc    Get all projects (with pagination and filtering)
 * @route   GET /api/projects
 * @access  Private
 */
exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter parameters
    const { status, priority, search, team } = req.query;

    let queryParams = [];
    let queryConditions = [];
    let countConditions = [];

    // Base query condition - Admin sees all projects, others see only their projects
    if (!isAdmin) {
      queryConditions.push(`
        (p.owner_id = $${queryParams.length + 1}
         OR EXISTS (
           SELECT 1 FROM project_members pm
           WHERE pm.project_id = p.project_id AND pm.user_id = $${
             queryParams.length + 1
           }
         ))
      `);
      countConditions.push(`
        (p.owner_id = $${queryParams.length + 1}
         OR EXISTS (
           SELECT 1 FROM project_members pm
           WHERE pm.project_id = p.project_id AND pm.user_id = $${
             queryParams.length + 1
           }
         ))
      `);
      queryParams.push(userId);
    }

    // Add status filter
    if (status) {
      queryConditions.push(`p.status = $${queryParams.length + 1}`);
      countConditions.push(`p.status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }

    // Add priority filter
    if (priority) {
      queryConditions.push(`p.priority = $${queryParams.length + 1}`);
      countConditions.push(`p.priority = $${queryParams.length + 1}`);
      queryParams.push(priority);
    }

    // Add team filter
    if (team) {
      queryConditions.push(`p.team_id = $${queryParams.length + 1}`);
      countConditions.push(`p.team_id = $${queryParams.length + 1}`);
      queryParams.push(team);
    }

    // Add search filter
    if (search) {
      queryConditions.push(`(
        p.project_name ILIKE $${queryParams.length + 1}
        OR p.description ILIKE $${queryParams.length + 1}
      )`);
      countConditions.push(`(
        p.project_name ILIKE $${queryParams.length + 1}
        OR p.description ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    // Combine conditions
    const whereClause =
      queryConditions.length > 0
        ? `WHERE ${queryConditions.join(" AND ")}`
        : "";
    const countWhereClause =
      countConditions.length > 0
        ? `WHERE ${countConditions.join(" AND ")}`
        : "";

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${countWhereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Main query with pagination
    const mainQueryParams = [...queryParams, limit, startIndex];
    const mainQuery = `
      SELECT p.project_id, p.project_name, p.description, p.start_date, p.end_date,
        p.status, p.priority, p.created_at, p.updated_at,
        u.user_id as owner_id, u.username as owner_username, u.first_name as owner_first_name, u.last_name as owner_last_name,
        t.team_id, t.team_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.project_id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.project_id AND status = 'Completed') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.user_id
      LEFT JOIN teams t ON p.team_id = t.team_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${mainQueryParams.length - 1}
      OFFSET $${mainQueryParams.length}
    `;

    const result = await query(mainQuery, mainQueryParams);

    // Pagination result
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    // Get project members for each project
    for (const project of result.rows) {
      const membersResult = await query(
        `SELECT u.user_id, u.username, u.first_name, u.last_name, u.profile_image_url, pm.role
         FROM project_members pm
         JOIN users u ON pm.user_id = u.user_id
         WHERE pm.project_id = $1`,
        [project.project_id]
      );

      project.members = membersResult.rows;
    }

    // Send response
    res.status(200).json({
      success: true,
      pagination,
      data: result.rows,
    });
  } catch (err) {
    logger.error(`Get projects error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
exports.getProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    // Check if project exists and user has access
    let projectQueryParams = [projectId];
    let projectAccessCondition = "";

    if (!isAdmin) {
      projectAccessCondition = `
        AND (
          p.owner_id = $2
          OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = p.project_id AND pm.user_id = $2
          )
        )
      `;
      projectQueryParams.push(userId);
    }

    const projectQuery = `
      SELECT p.project_id, p.project_name, p.description, p.start_date, p.end_date,
        p.status, p.priority, p.created_at, p.updated_at,
        u.user_id as owner_id, u.username as owner_username, u.first_name as owner_first_name, u.last_name as owner_last_name,
        t.team_id, t.team_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.user_id
      LEFT JOIN teams t ON p.team_id = t.team_id
      WHERE p.project_id = $1
      ${projectAccessCondition}
    `;

    const projectResult = await query(projectQuery, projectQueryParams);

    if (projectResult.rows.length === 0) {
      return next(new ErrorResponse("Project not found or access denied", 404));
    }

    const project = projectResult.rows[0];

    // Get project members
    const membersResult = await query(
      `SELECT u.user_id, u.username, u.first_name, u.last_name, u.profile_image_url, pm.role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.user_id
       WHERE pm.project_id = $1`,
      [projectId]
    );

    project.members = membersResult.rows;

    // Get project tasks
    const tasksResult = await query(
      `SELECT t.task_id, t.title, t.description, t.start_date, t.due_date, t.completed_date,
        t.status, t.priority, t.estimated_hours, t.actual_hours,
        u.user_id as assignee_id, u.username as assignee_username, u.first_name as assignee_first_name, u.last_name as assignee_last_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.user_id
       WHERE t.project_id = $1
       ORDER BY t.due_date ASC`,
      [projectId]
    );

    project.tasks = tasksResult.rows;

    // Get project documents
    const documentsResult = await query(
      `SELECT d.document_id, d.title, d.file_path, d.file_type, d.file_size,
        d.uploaded_at, u.user_id as uploader_id, u.username as uploader_username
       FROM documents d
       JOIN users u ON d.uploader_id = u.user_id
       WHERE d.project_id = $1
       ORDER BY d.uploaded_at DESC`,
      [projectId]
    );

    project.documents = documentsResult.rows;

    // Get project statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as todo_tasks,
        SUM(CASE WHEN status = 'Blocked' THEN 1 ELSE 0 END) as blocked_tasks,
        SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'Completed' THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(estimated_hours) as total_estimated_hours,
        SUM(actual_hours) as total_actual_hours
      FROM tasks
      WHERE project_id = $1
    `;

    const statsResult = await query(statsQuery, [projectId]);
    project.statistics = statsResult.rows[0];

    // Record view in logs
    await query(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "view_project",
        "project",
        projectId,
        `Viewed project: ${project.project_name}`,
        req.ip,
      ]
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    logger.error(`Get project error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
exports.createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      projectName,
      description,
      startDate,
      endDate,
      status,
      priority,
      teamId,
      members,
    } = req.body;

    // Validate input
    if (!projectName || !startDate || !status || !priority) {
      return next(new ErrorResponse("Please provide all required fields", 400));
    }

    // Create project with transaction
    const result = await transaction(async (client) => {
      // Insert project
      const projectResult = await client.query(
        `INSERT INTO projects
         (project_name, description, start_date, end_date, status, priority, owner_id, team_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING project_id, project_name, description, start_date, end_date, status, priority, created_at`,
        [
          projectName,
          description,
          startDate,
          endDate,
          status,
          priority,
          userId,
          teamId || null,
        ]
      );

      const project = projectResult.rows[0];

      // Add project members if provided
      if (members && members.length > 0) {
        for (const member of members) {
          await client.query(
            `INSERT INTO project_members (project_id, user_id, role)
             VALUES ($1, $2, $3)`,
            [project.project_id, member.userId, member.role]
          );
        }
      }

      // Always add the creator as a project member with 'manager' role if not already added
      const creatorExists = members && members.some((m) => m.userId === userId);
      if (!creatorExists) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (project_id, user_id) DO NOTHING`,
          [project.project_id, userId, "manager"]
        );
      }

      // Log project creation
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          "create_project",
          "project",
          project.project_id,
          `Created project: ${projectName}`,
          req.ip,
        ]
      );

      // Create notifications for team members
      if (teamId) {
        const teamMembersResult = await client.query(
          `SELECT user_id FROM team_members WHERE team_id = $1 AND user_id != $2`,
          [teamId, userId]
        );

        for (const teamMember of teamMembersResult.rows) {
          await client.query(
            `INSERT INTO notifications (user_id, title, message, notification_type, reference_id, reference_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              teamMember.user_id,
              "New Project Added",
              `You've been added to a new project: ${projectName}`,
              "project_created",
              project.project_id,
              "project",
            ]
          );
        }
      }

      return project;
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logger.error(`Create project error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
exports.updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    // Check if project exists and user has permission
    const projectCheckQuery = `
      SELECT owner_id FROM projects
      WHERE project_id = $1
    `;

    const projectCheckResult = await query(projectCheckQuery, [projectId]);

    if (projectCheckResult.rows.length === 0) {
      return next(new ErrorResponse("Project not found", 404));
    }

    // Check if user is admin, owner, or has manager role
    if (!isAdmin && projectCheckResult.rows[0].owner_id !== userId) {
      // Check if user is a project manager
      const managerCheckQuery = `
        SELECT 1 FROM project_members
        WHERE project_id = $1 AND user_id = $2 AND role = 'manager'
      `;

      const managerCheckResult = await query(managerCheckQuery, [
        projectId,
        userId,
      ]);

      if (managerCheckResult.rows.length === 0) {
        return next(
          new ErrorResponse("Not authorized to update this project", 403)
        );
      }
    }

    const {
      projectName,
      description,
      startDate,
      endDate,
      status,
      priority,
      teamId,
      members,
    } = req.body;

    // Update project with transaction
    const result = await transaction(async (client) => {
      // Update project details
      const updateProjectQuery = `
        UPDATE projects
        SET project_name = COALESCE($1, project_name),
            description = COALESCE($2, description),
            start_date = COALESCE($3, start_date),
            end_date = $4,
            status = COALESCE($5, status),
            priority = COALESCE($6, priority),
            team_id = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $8
        RETURNING project_id, project_name, description, start_date, end_date, status, priority, updated_at
      `;

      const updateProjectResult = await client.query(updateProjectQuery, [
        projectName,
        description,
        startDate,
        endDate, // Can be null to remove end date
        status,
        priority,
        teamId, // Can be null to remove team association
        projectId,
      ]);

      const project = updateProjectResult.rows[0];

      // Update project members if provided
      if (members && Array.isArray(members)) {
        // First, remove members not in the new list (except the owner)
        const currentMembersResult = await client.query(
          `SELECT user_id FROM project_members WHERE project_id = $1`,
          [projectId]
        );

        const currentMemberIds = currentMembersResult.rows.map(
          (m) => m.user_id
        );
        const newMemberIds = members.map((m) => m.userId);

        // Find members to remove (excluding project owner)
        const ownerId = projectCheckResult.rows[0].owner_id;
        const membersToRemove = currentMemberIds.filter(
          (id) => !newMemberIds.includes(id) && id !== ownerId
        );

        if (membersToRemove.length > 0) {
          const placeholders = membersToRemove
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");

          await client.query(
            `DELETE FROM project_members 
             WHERE project_id = $1 AND user_id IN (${placeholders})`,
            [projectId, ...membersToRemove]
          );
        }

        // Add new members or update roles
        for (const member of members) {
          await client.query(
            `INSERT INTO project_members (project_id, user_id, role)
             VALUES ($1, $2, $3)
             ON CONFLICT (project_id, user_id) 
             DO UPDATE SET role = EXCLUDED.role`,
            [projectId, member.userId, member.role]
          );

          // Create notification for new member
          if (!currentMemberIds.includes(member.userId)) {
            await client.query(
              `INSERT INTO notifications (user_id, title, message, notification_type, reference_id, reference_type)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                member.userId,
                "Added to Project",
                `You've been added to project: ${project.project_name}`,
                "project_member_added",
                projectId,
                "project",
              ]
            );
          }
        }
      }

      // Log project update
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          "update_project",
          "project",
          projectId,
          `Updated project: ${project.project_name}`,
          req.ip,
        ]
      );

      return project;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logger.error(`Update project error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    // Check if project exists and user has permission
    const projectCheckQuery = `
      SELECT project_id, project_name, owner_id FROM projects
      WHERE project_id = $1
    `;

    const projectCheckResult = await query(projectCheckQuery, [projectId]);

    if (projectCheckResult.rows.length === 0) {
      return next(new ErrorResponse("Project not found", 404));
    }

    // Only admin or project owner can delete
    if (!isAdmin && projectCheckResult.rows[0].owner_id !== userId) {
      return next(
        new ErrorResponse("Not authorized to delete this project", 403)
      );
    }

    const projectName = projectCheckResult.rows[0].project_name;

    // Delete project with transaction (handle dependencies)
    await transaction(async (client) => {
      // Delete related records first
      await client.query(
        "DELETE FROM task_comments WHERE task_id IN (SELECT task_id FROM tasks WHERE project_id = $1)",
        [projectId]
      );
      await client.query(
        "DELETE FROM time_entries WHERE task_id IN (SELECT task_id FROM tasks WHERE project_id = $1)",
        [projectId]
      );
      await client.query(
        "DELETE FROM task_dependencies WHERE dependent_task_id IN (SELECT task_id FROM tasks WHERE project_id = $1) OR prerequisite_task_id IN (SELECT task_id FROM tasks WHERE project_id = $1)",
        [projectId]
      );
      await client.query("DELETE FROM tasks WHERE project_id = $1", [
        projectId,
      ]);
      await client.query("DELETE FROM documents WHERE project_id = $1", [
        projectId,
      ]);
      await client.query("DELETE FROM calendar_events WHERE project_id = $1", [
        projectId,
      ]);
      await client.query("DELETE FROM project_members WHERE project_id = $1", [
        projectId,
      ]);

      // Finally delete the project
      await client.query("DELETE FROM projects WHERE project_id = $1", [
        projectId,
      ]);

      // Log project deletion
      await client.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          "delete_project",
          "project",
          projectId,
          `Deleted project: ${projectName}`,
          req.ip,
        ]
      );
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    logger.error(`Delete project error: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/:id/statistics
 * @access  Private
 */
exports.getProjectStatistics = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    // Check if project exists and user has access
    let projectAccessQuery = `
      SELECT 1 FROM projects p
      WHERE p.project_id = $1
    `;

    let queryParams = [projectId];

    if (!isAdmin) {
      projectAccessQuery += `
        AND (
          p.owner_id = $2
          OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = p.project_id AND pm.user_id = $2
          )
        )
      `;
      queryParams.push(userId);
    }

    const projectAccessResult = await query(projectAccessQuery, queryParams);

    if (projectAccessResult.rows.length === 0) {
      return next(new ErrorResponse("Project not found or access denied", 404));
    }

    // Get task statistics
    const taskStatsQuery = `
      SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as todo_tasks,
        SUM(CASE WHEN status = 'Blocked' THEN 1 ELSE 0 END) as blocked_tasks,
        SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'Completed' THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(estimated_hours) as total_estimated_hours,
        SUM(actual_hours) as total_actual_hours,
        ROUND(AVG(CASE WHEN status = 'Completed' THEN actual_hours / NULLIF(estimated_hours, 0) ELSE NULL END) * 100) as avg_estimation_accuracy
      FROM tasks
      WHERE project_id = $1
    `;

    const taskStatsResult = await query(taskStatsQuery, [projectId]);

    // Get member statistics
    const memberStatsQuery = `
      SELECT
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(t.task_id) as assigned_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Completed' THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(t.actual_hours) as total_hours
      FROM project_members pm
      JOIN users u ON pm.user_id = u.user_id
      LEFT JOIN tasks t ON t.assignee_id = u.user_id AND t.project_id = pm.project_id
      WHERE pm.project_id = $1
      GROUP BY u.user_id, u.username, u.first_name, u.last_name, u.profile_image_url
      ORDER BY total_hours DESC NULLS LAST
    `;

    const memberStatsResult = await query(memberStatsQuery, [projectId]);

    // Get time tracking data
    const timeTrackingQuery = `
      SELECT
        date_trunc('day', te.start_time) as day,
        SUM(te.hours_logged) as hours
      FROM time_entries te
      JOIN tasks t ON te.task_id = t.task_id
      WHERE t.project_id = $1
      GROUP BY day
      ORDER BY day ASC
    `;

    const timeTrackingResult = await query(timeTrackingQuery, [projectId]);

    // Get task priority distribution
    const priorityDistributionQuery = `
      SELECT
        priority,
        COUNT(*) as count
      FROM tasks
      WHERE project_id = $1
      GROUP BY priority
      ORDER BY
        CASE
          WHEN priority = 'Critical' THEN 1
          WHEN priority = 'High' THEN 2
          WHEN priority = 'Medium' THEN 3
          WHEN priority = 'Low' THEN 4
          ELSE 5
        END
    `;

    const priorityDistributionResult = await query(priorityDistributionQuery, [
      projectId,
    ]);

    // Compile statistics
    const statistics = {
      taskStats: taskStatsResult.rows[0],
      memberStats: memberStatsResult.rows,
      timeTracking: timeTrackingResult.rows,
      priorityDistribution: priorityDistributionResult.rows,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (err) {
    logger.error(`Get project statistics error: ${err.message}`);
    next(err);
  }
};
