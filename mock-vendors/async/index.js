const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

app.post("/data", async (req, res) => {
  const { request_id, payload } = req.body;
  setTimeout(async () => {
    await axios.post("http://api:3000/vendor-webhook/async", {
      request_id,
      data: {
        ...payload,
        vendor: "async",
        timestamp: new Date().toISOString(),
        email: "user@example.com", // Mock PII to be cleaned
      },
    });
  }, 2000);
  res.json({ status: "accepted", request_id });
});

app.listen(3002, () => console.log("Async vendor running on port 3002"));
