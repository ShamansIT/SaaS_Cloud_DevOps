// Node.js 20.x
const { Logger } = require("@aws-lambda-powertools/logger");
const { Metrics, MetricUnit } = require("@aws-lambda-powertools/metrics");

const logger = new Logger({ serviceName: process.env.POWERTOOLS_SERVICE_NAME || "tickets-api" });
const metrics = new Metrics({ namespace: process.env.POWERTOOLS_METRICS_NAMESPACE || "Tickets" });
exports.handler = async (event) => {
  const limit = event?.queryStringParameters?.limit;
    // Demo data
    const items = [
    { id: "t-1001", title: "First ticket", priority: "LOW" },
    { id: "t-1002", title: "Second ticket", priority: "HIGH" }
    ];
  
    const sliced = limit ? items.slice(0, Number(limit)) : items;

    // Powertools telemetry before returning
    metrics.addMetric("TicketsListed", MetricUnit.Count, (limit ? sliced.length : items.length));
    logger.info("GET /tickets", { limit, size: (limit ? sliced.length : items.length) });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify({ items: sliced })
  };
};

