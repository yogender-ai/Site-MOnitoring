const axios = require("axios");
const { pool } = require("./db");
const https = require("https");

const agent = new https.Agent({
  keepAlive: false,
});
const { sendSiteDownAlert, sendSiteUpAlert } = require("./utils/mailer");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determine UP/DOWN based on HTTP response
 */
function computeStatusFromResponse(response) {
  return response.status >= 200 && response.status < 400 ? "UP" : "DOWN";
}

/**
 * Classify error type (for better debugging & future improvements)
 */
function classifyError(error) {
  if (!error) return null;

  if (error.code === "ECONNABORTED") return "TIMEOUT";
  if (error.code === "ENOTFOUND") return "DNS_ERROR";
  if (error.code === "ECONNREFUSED") return "CONNECTION_REFUSED";
  if (error.message?.includes("socket hang up")) return "CONNECTION_RESET";

  if (error.response) return `HTTP_${error.response.status}`;

  return "UNKNOWN_ERROR";
} // updated classifyError to detect connection reset errors which are common in failed pings , Real magic

/**
 * Perform ping with retries
 */
const performPingWithRetries = async (url) => {
  const maxRetries = 3;
  let attempts = 0;

  let lastError = null;
  let lastResponse = null;
  let latency = 0;
  let finalStatus = "DOWN";

  while (attempts < maxRetries) {
    attempts++;
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        httpsAgent: agent,
        timeout: 15000,
        validateStatus: () => true,
        maxRedirects: 5,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      latency = Date.now() - startTime;
      lastResponse = response;

      const status = computeStatusFromResponse(response);

      console.log("✅ Ping Success:", {
        url,
        attempt: attempts,
        statusCode: response.status,
        latency: `${latency}ms`,
      });

      if (status === "UP") {
        return {
          status: "UP",
          latency,
          axiosResponse: response,
          caughtError: null,
        };
      }

      finalStatus = status;
    } catch (error) {
      latency = Date.now() - startTime;
      lastError = error;

      const errorType = classifyError(error);

      console.log("❌ Ping Error:", {
        url,
        attempt: attempts,
        errorType,
        message: error.message,
        latency: `${latency}ms`,
      });
    }

    // wait before retry
    if (attempts < maxRetries) {
      await sleep(1000);
    }
  }

  console.log("⚠️ Final Result (after retries):", {
    url,
    finalStatus,
    error: lastError?.message,
    statusCode: lastResponse?.status,
  });

  return {
    status: finalStatus,
    latency,
    axiosResponse: lastResponse,
    caughtError: lastError,
  };
};

/**
 * Extract status code for alerts
 */
function describeStatusForAlert(error, response) {
  if (response) return response.status;
  if (error?.response) return error.response.status;
  return null;
}

/**
 * Main pinger loop
 */
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
        now - new Date(monitor.last_checked) >=
          monitor.interval_seconds * 1000 - 2000
      ) {
        const previousStatus = monitor.status;

        const { status, latency, axiosResponse, caughtError } =
          await performPingWithRetries(monitor.url);

        const statusCodeForAlert = describeStatusForAlert(
          caughtError,
          axiosResponse,
        );

        // Update DB
        await pool.query(
          "UPDATE monitors SET status = $1, last_checked = NOW() WHERE id = $2",
          [status, monitor.id],
        );

        await pool.query(
          "INSERT INTO logs (monitor_id, status, latency) VALUES ($1, $2, $3)",
          [monitor.id, status, latency],
        );

        const targetEmail = monitor.notification_email || monitor.primary_email;

        const timestamp = new Date().toISOString();

        // Alerts
        if (targetEmail) {
          if (previousStatus === "UP" && status === "DOWN") {
            console.log("🚨 ALERT: Site DOWN", monitor.url);

            await sendSiteDownAlert({
              to: targetEmail,
              siteUrl: monitor.url,
              statusCode: statusCodeForAlert,
              timestamp,
            });
          } else if (previousStatus === "DOWN" && status === "UP") {
            console.log("✅ RECOVERY: Site UP", monitor.url);

            await sendSiteUpAlert(targetEmail, monitor.url, timestamp);
          }
        }
      }
    }
  } catch (error) {
    console.error("🔥 Error in Pinger:", error);
  }
};

/**
 * Start engine
 */
const startPinger = () => {
  console.log("🚀 Starting Pinger Engine...");
  setInterval(pingAll, 30000);
  pingAll();
};

module.exports = { startPinger };
