const axios = require('axios');
const { pool } = require('./db');
const { sendSiteDownAlert } = require('./utils/mailer');

function computeStatusFromResponse(response) {
  return response.status >= 200 && response.status < 400 ? 'UP' : 'DOWN';
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const performPingWithRetries = async (url) => {
  let attempts = 0;
  const maxRetries = 3;
  let lastError = null;
  let lastResponse = null;
  let latency = 0;
  let finalStatus = 'DOWN';

  while (attempts < maxRetries) {
    attempts++;
    const startTime = Date.now();
    try {
      const resp = await axios.get(url, {
        timeout: 15000,
        validateStatus: () => true,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      latency = Date.now() - startTime;
      lastResponse = resp;
      finalStatus = computeStatusFromResponse(resp);
      
      if (finalStatus === 'UP') {
        return { status: finalStatus, latency, axiosResponse: resp, caughtError: null };
      }
    } catch (error) {
      latency = Date.now() - startTime;
      lastError = error;
    }
    
    if (attempts < maxRetries) {
      await sleep(1000);
    }
  }

  return { status: finalStatus, latency, axiosResponse: lastResponse, caughtError: lastError };
};

function describeStatusForAlert(error, response) {
  if (response) {
    return response.status;
  }
  if (error && error.response) {
    return error.response.status;
  }
  return null;
}

const pingAll = async () => {
  try {
    const { rows: monitors } = await pool.query(`
      SELECT m.*, u.email as primary_email, u.notification_email
      FROM monitors m
      INNER JOIN users u ON m.user_id = u.id
      WHERE m.user_id IS NOT NULL
    `);

    for (const monitor of monitors) {
      const now = new Date();
      if (
        !monitor.last_checked ||
        now - new Date(monitor.last_checked) >= monitor.interval_seconds * 1000 - 2000
      ) {
        const previousStatus = monitor.status;
        const { status, latency, axiosResponse, caughtError } = await performPingWithRetries(monitor.url);

        const statusCodeForAlert = describeStatusForAlert(caughtError, axiosResponse);

        await pool.query(
          'UPDATE monitors SET status = $1, last_checked = NOW() WHERE id = $2',
          [status, monitor.id]
        );

        await pool.query(
          'INSERT INTO logs (monitor_id, status, latency) VALUES ($1, $2, $3)',
          [monitor.id, status, latency]
        );

        const targetEmail = monitor.notification_email || monitor.primary_email;

        if (targetEmail) {
          const timestamp = new Date().toISOString();
          if (previousStatus === 'UP' && status === 'DOWN') {
            await sendSiteDownAlert({
              to: targetEmail,
              siteUrl: monitor.url,
              statusCode: statusCodeForAlert,
              timestamp,
            });
          } else if (previousStatus === 'DOWN' && status === 'UP') {
            await sendSiteUpAlert(targetEmail, monitor.url, timestamp);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in Pinger:', error);
  }
};

const startPinger = () => {
  console.log('Starting Pinger Engine...');
  setInterval(pingAll, 30000);
  pingAll();
};

module.exports = { startPinger };
