const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const logger = require("./utils/logger");

// Load env vars
require("dotenv").config();

// Create pool directly instead of using the shared config
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "remote_business_db",
  password: "123456",
  port: 5432,
});

// Test connection before proceeding
pool.connect((err, client, done) => {
  if (err) {
    logger.error(`Connection error: ${err.message}`);
    process.exit(1);
  }
  logger.info("Database connected successfully");
  done();

  // Only continue with seeding after successful connection
  createDemoData();
});

// Create demo data
const createDemoData = async () => {
  try {
    // Create roles
    await pool.query(`
      INSERT INTO roles (role_name, description)
      VALUES 
        ('admin', 'Administrator with full access'),
        ('manager', 'Project manager with team management access'),
        ('user', 'Regular user with limited access')
      ON CONFLICT (role_name) DO NOTHING
    `);

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("password123", salt);

    const userResult = await pool.query(
      `
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        job_title, is_active
      )
      VALUES (
        'admin', 'admin@example.com', $1, 'Admin', 'User', 
        'System Administrator', true
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING user_id
    `,
      [password]
    );

    if (userResult.rows.length > 0) {
      const adminUserId = userResult.rows[0].user_id;

      // Assign admin role
      await pool.query(
        `
        INSERT INTO user_roles (user_id, role_id)
        SELECT $1, role_id FROM roles WHERE role_name = 'admin'
        ON CONFLICT (user_id, role_id) DO NOTHING
      `,
        [adminUserId]
      );

      // Create demo team
      const teamResult = await pool.query(
        `
        INSERT INTO teams (team_name, description, created_by)
        VALUES ('Development Team', 'Core development team', $1)
        ON CONFLICT DO NOTHING
        RETURNING team_id
      `,
        [adminUserId]
      );

      if (teamResult.rows.length > 0) {
        const teamId = teamResult.rows[0].team_id;

        // Add admin to team
        await pool.query(
          `
          INSERT INTO team_members (team_id, user_id, role)
          VALUES ($1, $2, 'leader')
          ON CONFLICT (team_id, user_id) DO NOTHING
        `,
          [teamId, adminUserId]
        );

        // Create demo project
        const projectResult = await pool.query(
          `
          INSERT INTO projects (
            project_name, description, start_date, end_date, 
            status, priority, owner_id, team_id
          )
          VALUES (
            'Remote Business Management System', 
            'Development of a comprehensive remote work management platform', 
            CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days',
            'In Progress', 'High', $1, $2
          )
          ON CONFLICT DO NOTHING
          RETURNING project_id
        `,
          [adminUserId, teamId]
        );

        if (projectResult.rows.length > 0) {
          const projectId = projectResult.rows[0].project_id;

          // Add admin to project
          await pool.query(
            `
            INSERT INTO project_members (project_id, user_id, role)
            VALUES ($1, $2, 'manager')
            ON CONFLICT (project_id, user_id) DO NOTHING
          `,
            [projectId, adminUserId]
          );

          // Create some demo tasks
          await pool.query(
            `
            INSERT INTO tasks (
              project_id, title, description, start_date, due_date,
              status, priority, creator_id, assignee_id
            )
            VALUES
              (
                $1, 'Database Design', 'Create database schema for the project', 
                CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days',
                'Completed', 'High', $2, $2
              ),
              (
                $1, 'API Development', 'Develop REST API endpoints', 
                CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '21 days',
                'In Progress', 'High', $2, $2
              ),
              (
                $1, 'Frontend Implementation', 'Develop the user interface', 
                CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '35 days',
                'To Do', 'Medium', $2, $2
              )
            ON CONFLICT DO NOTHING
          `,
            [projectId, adminUserId]
          );
        }
      }
    }

    logger.info("Demo data created successfully");
    process.exit();
  } catch (err) {
    logger.error(`Error creating demo data: ${err.message}`);
    process.exit(1);
  }
};

// Run seeder
createDemoData();
