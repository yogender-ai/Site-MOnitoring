const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/mailer');
const crypto = require('crypto');

const router = express.Router();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// Request OTP for new notification email
router.post('/notification-email/request-otp', requireAuth, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Delete any existing unused OTPs for this user
    await pool.query('DELETE FROM otps WHERE user_id = $1', [req.user.id]);

    await pool.query(
      'INSERT INTO otps (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)',
      [req.user.id, normalizedEmail, code, expiresAt]
    );

    await sendOtpEmail(normalizedEmail, code);

    res.json({ message: 'OTP sent to ' + normalizedEmail });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ error: 'Failed to request OTP' });
  }
});

// Verify OTP and set notification email
router.post('/notification-email/verify-otp', requireAuth, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { rows } = await pool.query(
      'SELECT * FROM otps WHERE user_id = $1 AND email = $2 AND code = $3 AND expires_at > NOW()',
      [req.user.id, normalizedEmail, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update users table
    await pool.query('UPDATE users SET notification_email = $1 WHERE id = $2', [normalizedEmail, req.user.id]);

    // Cleanup OTPs
    await pool.query('DELETE FROM otps WHERE user_id = $1', [req.user.id]);

    res.json({ message: 'Notification email updated successfully', notification_email: normalizedEmail });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;
