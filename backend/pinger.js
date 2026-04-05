const axios = require('axios');
const { pool } = require('./db');

const pingAll = async () => {
  try {
    const { rows: monitors } = await pool.query(
      'SELECT * FROM monitors WHERE user_id IS NOT NULL'
    );
    
    for (let monitor of monitors) {
      // Very simple logic: We check if it's time to ping based on interval_seconds
      const now = new Date();
      if (!monitor.last_checked || (now - new Date(monitor.last_checked)) >= (monitor.interval_seconds * 1000) - 2000) {
        
        let status = 'DOWN';
        let latency = 0;
        const startTime = Date.now();

        try {
          const response = await axios.get(monitor.url, { timeout: 10000 });
          if (response.status >= 200 && response.status < 400) {
            status = 'UP';
          }
          latency = Date.now() - startTime;
        } catch (error) {
          status = 'DOWN';
          latency = Date.now() - startTime;
        }

        // Update monitor status
        await pool.query(
          'UPDATE monitors SET status = $1, last_checked = NOW() WHERE id = $2',
          [status, monitor.id]
        );

        // Insert log
        await pool.query(
          'INSERT INTO logs (monitor_id, status, latency) VALUES ($1, $2, $3)',
          [monitor.id, status, latency]
        );
      }
    }
  } catch (error) {
    console.error("Error in Pinger:", error);
  }
};

const startPinger = () => {
  console.log("Starting Pinger Engine...");
  setInterval(pingAll, 30000); // Check every 30 seconds
  pingAll(); // initial run
};

module.exports = { startPinger };
