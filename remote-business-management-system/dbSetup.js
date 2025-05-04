// dbSetup.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('./utils/logger');

// Load env vars
require('dotenv').config();

// Create pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'remote_business_db',
  password: '123456',
  port: 5432,
});

async function setupDatabase() {
  try {
    // Read the SQL schema file
    let schemaSQL = fs.readFileSync(path.join(__dirname, 'db_schema.sql'), 'utf8');

    // Remove the problematic line
    schemaSQL = schemaSQL.replace('ALTER TABLE users DROP COLUMN IF EXISTS ;', '');

    // Connect to database
    const client = await pool.connect();

    logger.info('Creating database schema...');

    // Split the SQL into individual statements
    const statements = schemaSQL
      .replace(/--.*$|\/\*[\s\S]*?\*\//gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim() !== '');

    // Execute each statement separately
    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        // Log the error but continue with other statements
        logger.error(`Error executing statement: ${err.message}`);
      }
    }

    logger.info('Database schema created successfully');
    client.release();
    process.exit(0);
  } catch (err) {
    logger.error(`Database setup error: ${err.message}`);
    process.exit(1);
  }
}

setupDatabase();