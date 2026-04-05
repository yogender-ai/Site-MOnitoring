const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return !!(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );
}

let transporter = null;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.isFinite(port) ? port : 587,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends a plain-text alert when a site is considered down (non-200 or request failure).
 * Fails gracefully: logs errors, never throws to callers.
 *
 * @param {object} params
 * @param {string} params.to - Recipient email (user)
 * @param {string} params.siteUrl - Monitored URL
 * @param {string|number|null} params.statusCode - HTTP status or null if no response
 * @param {string} params.timestamp - ISO or human-readable timestamp
 */
async function sendSiteDownAlert({ to, siteUrl, statusCode, timestamp }) {
  const transport = getTransporter();
  if (!transport) {
    return;
  }

  const statusLine =
    statusCode === null || statusCode === undefined
      ? 'N/A (no HTTP response — request failed or timed out)'
      : String(statusCode);

  const body = [
    'A monitored endpoint is not returning HTTP 200.',
    '',
    `Site URL: ${siteUrl}`,
    `HTTP status: ${statusLine}`,
    `Time: ${timestamp}`,
    '',
    'You are receiving this because this monitor transitioned from UP to DOWN.',
  ].join('\n');

  try {
    await transport.sendMail({
      from: `"Site Monitor" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Site Down Alert',
      text: body,
    });
  } catch (err) {
    console.error('[mailer] Failed to send Site Down Alert:', err.message);
  }
}

module.exports = {
  isEmailConfigured,
  sendSiteDownAlert,
};
