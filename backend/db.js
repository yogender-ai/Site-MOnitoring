const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDB = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Please set it in .env file.");
    return;
  }
  try {
    // Create monitors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monitors (
        id SERIAL PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        interval_seconds INTEGER DEFAULT 60,
        status VARCHAR(50) DEFAULT 'UP',
        last_checked TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create logs table for latency
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        latency INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE monitors ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_visits (
        id SERIAL PRIMARY KEY,
        date DATE DEFAULT CURRENT_DATE,
        visits INTEGER DEFAULT 1,
        UNIQUE(date)
      );
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS monitor_visits (
        id SERIAL PRIMARY KEY,
        monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
        date DATE DEFAULT CURRENT_DATE,
        hour INTEGER NOT NULL,
        visits INTEGER DEFAULT 1,
        UNIQUE(monitor_id, date, hour)
      );
    `);

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

module.exports = { pool, initDB };
