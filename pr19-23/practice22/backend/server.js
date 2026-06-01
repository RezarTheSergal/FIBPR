const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || "default";
app.get("/", (req, res) => {
  console.log(`Received request on ${SERVER_NAME} (Port: ${PORT})`);
  res.json({
    message: "Response from backend server",
    server: SERVER_NAME,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});
app.listen(PORT, () => {
  console.log(`Server ${SERVER_NAME} started on port ${PORT}`);
});
