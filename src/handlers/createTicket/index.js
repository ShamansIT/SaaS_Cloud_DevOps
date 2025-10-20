// Node.js 20.x
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return reply(400, { message: "Invalid JSON" });
  }

// Additionnal protected check; main validation by API Gateway Model
  if (!payload || typeof payload.title !== "string" || payload.title.trim() === "") {
    return reply(400, { message: "Field 'title' is required" });
  }

  const ticket = {
    id: `t-${randomUUID().slice(0, 8)}`,
    title: payload.title.trim(),
    priority: payload.priority || "LOW",
    createdAt: new Date().toISOString()
  };
  return reply(201, { ticket });
};

function reply(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}





