
const express = require('express');
const app = express();
app.use(express.json());

app.post('/data', (req, res) => {
  const { request_id, payload } = req.body;
  res.json({
    request_id,
    data: {
      ...payload,
      vendor: 'sync',
      timestamp: new Date().toISOString(),
      email: 'user@example.com' // Mock PII to be cleaned
    }
  });
});

app.listen(3001, () => console.log('Sync vendor running on port 3001'));