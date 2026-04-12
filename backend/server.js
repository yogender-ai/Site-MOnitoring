const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool, initDB } = require('./db');
const { startPinger } = require('./pinger');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const { sendMonitorActionAlert } = require('./utils/mailer');

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

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', analyticsRoutes);

// 1. Keep-Alive for Uptime Robot
app.get('/api/keep-alive', (req, res) => {
  res.status(200).send('Alive');
});

// 2. Get all monitors (authenticated, scoped to user)
app.get('/api/monitors', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM monitors WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Add a monitor
const rateLimit = require('express-rate-limit');
const createMonitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many monitors created from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/monitors', requireAuth, createMonitorLimiter, async (req, res) => {
  const { url, name, interval_seconds } = req.body;
  if (!url || !name) return res.status(400).json({ error: 'missing fields' });

  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE user_id = $1', [req.user.id]);
    const monitorCount = parseInt(countRes.rows[0].count, 10);
    
    if (monitorCount >= 15) {
      return res.status(403).json({ error: 'Monitor limit reached. You can only create up to 15 monitors.' });
    }

    const { rows } = await pool.query(
      'INSERT INTO monitors (url, name, interval_seconds, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [url, name, interval_seconds || 60, 'UP', req.user.id]
    );

    const userRes = await pool.query('SELECT email, notification_email FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      const notifyEmail = u.notification_email || u.email;
      if (notifyEmail) {
        await sendMonitorActionAlert(notifyEmail, 'added', url).catch(err => console.error(err));
      }
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete a monitor
app.delete('/api/monitors/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const monitorRes = await pool.query('SELECT url FROM monitors WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (monitorRes.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    const url = monitorRes.rows[0].url;

    await pool.query('DELETE FROM monitors WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    
    const userRes = await pool.query('SELECT email, notification_email FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      const notifyEmail = u.notification_email || u.email;
      if (notifyEmail) {
        await sendMonitorActionAlert(notifyEmail, 'deleted', url).catch(err => console.error(err));
      }
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get logs for a monitor (e.g. last 50)
app.get('/api/monitors/:id/logs', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const own = await pool.query('SELECT 1 FROM monitors WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (own.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    const { rows } = await pool.query(
      'SELECT * FROM logs WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT 50',
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Export logs as CSV
app.get('/api/monitors/:id/logs/csv', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const own = await pool.query('SELECT name FROM monitors WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (own.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    const { rows } = await pool.query(
      'SELECT status, latency, created_at FROM logs WHERE monitor_id = $1 ORDER BY created_at DESC',
      [id]
    );

    let csvContent = 'Timestamp,Status,Latency(ms)\\n';
    rows.forEach(row => {
      csvContent += `${new Date(row.created_at).toISOString()},${row.status},${row.latency}\\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="monitor-${id}-logs.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Analytics endpoints
app.post('/api/analytics/visit', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO platform_visits (date, visits) 
      VALUES (CURRENT_DATE, 1) 
      ON CONFLICT (date) DO UPDATE SET visits = platform_visits.visits + 1
    `);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/visits', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, visits 
      FROM platform_visits 
      ORDER BY date DESC LIMIT 30
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    }).on('error', (err) => {
      console.log('Self-ping Error: ' + err.message);
    });
  }, 10 * 60 * 1000); // 10 mins
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
