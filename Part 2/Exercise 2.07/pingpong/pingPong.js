const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

let counter = 0;

app.get('/pingpong', (req, res) => {
  res.json({ pingpong: counter });
  counter++;
});

app.listen(PORT, () => {
  console.log(`Ping-Pong app listening on port ${PORT}`);
});