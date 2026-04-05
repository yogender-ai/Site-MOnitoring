const axios = require('axios');
const { pool } = require('./db');
const { sendSiteDownAlert } = require('./utils/mailer');

/** UP only when the server returns exactly HTTP 200 (requirement: alert on non-200). */
function computeStatusFromResponse(response) {
  return response.status === 200 ? 'UP' : 'DOWN';
}

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
      SELECT m.*, u.email AS user_email
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

        let status = 'DOWN';
        let latency = 0;
        const startTime = Date.now();
        let axiosResponse = null;
        let caughtError = null;

        try {
          axiosResponse = await axios.get(monitor.url, {
            timeout: 10000,
            validateStatus: () => true,
          });
          status = computeStatusFromResponse(axiosResponse);
          latency = Date.now() - startTime;
        } catch (error) {
          caughtError = error;
          status = 'DOWN';
          latency = Date.now() - startTime;
        }

        const statusCodeForAlert = describeStatusForAlert(caughtError, axiosResponse);

        await pool.query(
          'UPDATE monitors SET status = $1, last_checked = NOW() WHERE id = $2',
          [status, monitor.id]
        );

        await pool.query(
          'INSERT INTO logs (monitor_id, status, latency) VALUES ($1, $2, $3)',
          [monitor.id, status, latency]
        );

        if (previousStatus === 'UP' && status === 'DOWN' && monitor.user_email) {
          const timestamp = new Date().toISOString();
          await sendSiteDownAlert({
            to: monitor.user_email,
            siteUrl: monitor.url,
            statusCode: statusCodeForAlert,
            timestamp,
          });
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
