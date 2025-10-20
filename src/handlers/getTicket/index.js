// Node.js 20.x
exports.handler = async () => {
    // Demo data
    const items = [
    { id: "t-1001", title: "First ticket", priority: "LOW" },
    { id: "t-1002", title: "Second ticket", priority: "HIGH" }
  ];

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify({ items })
  };
};