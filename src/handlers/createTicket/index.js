// Node.js 20.x
const { Logger } = require("@aws-lambda-powertools/logger");
const { Metrics, MetricUnit } = require("@aws-lambda-powertools/metrics");
const logger = new Logger({ serviceName: process.env.POWERTOOLS_SERVICE_NAME || "tickets-api" });
const metrics = new Metrics({ namespace: process.env.POWERTOOLS_METRICS_NAMESPACE || "Tickets" });
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (e){
    logger.warn("Invalid JSON", { error: e?.message });
    return reply(400, { message: "Invalid JSON" });
  }

// Additionnal protected check; main validation by API Gateway Model
  if (!payload || typeof payload.title !== "string" || payload.title.trim() === "") {
    logger.warn("Missing 'title' in body");
    return reply(400, { message: "Field 'title' is required" });
  }

  const ticket = {
    id: `t-${randomUUID().slice(0, 8)}`,
    title: payload.title.trim(),
    priority: payload.priority || "LOW",
    createdAt: new Date().toISOString()
  };
  metrics.addMetric("TicketCreated", MetricUnit.Count, 1);
  logger.info("Ticket created", { id: ticket.id, priority: ticket.priority });
  return reply(201, { ticket });
  
};

function reply(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}





