const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool, initDB } = require('./db');
const { startPinger } = require('./pinger');

const app = express();
app.use(cors());
app.use(express.json());

// Main init
initDB().then(() => {
  startPinger();
});

// -------------
// API Endpoints
// -------------

// 1. Keep-Alive for Uptime Robot
app.get('/api/keep-alive', (req, res) => {
  res.status(200).send("Alive");
});

// 2. Get all monitors
app.get('/api/monitors', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM monitors ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Add a monitor
app.post('/api/monitors', async (req, res) => {
  const { url, name, interval_seconds } = req.body;
  if (!url || !name) return res.status(400).json({ error: "missing fields" });
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO monitors (url, name, interval_seconds, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [url, name, interval_seconds || 60, 'UP']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete a monitor
app.delete('/api/monitors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM monitors WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get logs for a monitor (e.g. last 50)
app.get('/api/monitors/:id/logs', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM logs WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT 50',
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Self-ping block to prevent sleeping on free tiers
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL;
if (RENDER_URL) {
  setInterval(() => {
    // Determine http or https
    const httpModule = RENDER_URL.startsWith('https') ? require('https') : require('http');
    httpModule.get(`${RENDER_URL}/api/keep-alive`, (resp) => {
      console.log(`Self-ping complete: ${resp.statusCode}`);
    }).on("error", (err) => {
      console.log("Self-ping Error: " + err.message);
    });
  }, 14 * 60 * 1000); // 14 mins
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
