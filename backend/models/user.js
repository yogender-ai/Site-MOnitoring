const { pool } = require('../db');

async function findByEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [
    normalized,
  ]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ email, passwordHash }) {
  const normalized = String(email).trim().toLowerCase();
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [normalized, passwordHash]
  );
  return rows[0];
}

module.exports = { findByEmail, findById, create };
