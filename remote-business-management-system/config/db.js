const { Pool } = require("pg");
const logger = require("../utils/logger");

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info("PostgreSQL database connected successfully");
    client.release();
  } catch (err) {
    logger.error(`Error connecting to database: ${err.message}`);
    process.exit(1);
  }
};

// Query function to handle database operations
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(
      `Executed query: ${text} - Duration: ${duration}ms - Rows: ${res.rowCount}`
    );
    return res;
  } catch (err) {
    logger.error(`Query error: ${err.message} for query: ${text}`);
    throw err;
  }
};

// Transaction function
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error(`Transaction error: ${err.message}`);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  connectDB,
  query,
  transaction,
};
