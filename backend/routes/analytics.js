const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Track a visit for a monitor
// This endpoint is meant to be called from the user's website using an image tag or JS
router.get('/track/:monitorId', async (req, res) => {
  const { monitorId } = req.params;
  
  if (!monitorId) {
    return res.status(400).json({ error: 'monitorId is required' });
  }

  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const hour = new Date().getUTCHours(); // 0-23

  try {
    await pool.query(`
      INSERT INTO monitor_visits (monitor_id, date, hour, visits) 
      VALUES ($1, $2, $3, 1) 
      ON CONFLICT (monitor_id, date, hour) DO UPDATE SET visits = monitor_visits.visits + 1
    `, [monitorId, date, hour]);

    // Return a 1x1 transparent gif so this can be used as an img tag tracking pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  } catch (error) {
    // We don't want to break the user's site, so just return the pixel even if it fails
    // or log error
    console.error('Tracking pixel error:', error);
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
    });
    res.end(pixel);
  }
});

// Get analytics for a specific monitor
router.get('/monitors/:id/analytics', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership
    const own = await pool.query('SELECT 1 FROM monitors WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (own.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Get visits grouped by date
    const { rows: dailyVisits } = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, SUM(visits) as visits 
      FROM monitor_visits 
      WHERE monitor_id = $1 
      GROUP BY date 
      ORDER BY date DESC LIMIT 30
    `, [id]);

    // Get visits for today grouped by hour
    const { rows: hourlyVisits } = await pool.query(`
      SELECT hour, SUM(visits) as visits 
      FROM monitor_visits 
      WHERE monitor_id = $1 AND date = CURRENT_DATE 
      GROUP BY hour 
      ORDER BY hour ASC
    `, [id]);

    res.json({ dailyVisits, hourlyVisits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
