const express = require('express');
const app = express();
const fs = require('fs');
const PORT = process.env.PORT || 3001;

let counter = 0;

app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter}`);
  fs.writeFileSync('/data/pingpong.txt',`pong ${counter}\n` )
  counter++;
});

app.listen(PORT, () => {
  console.log(`Ping-Pong app listening on port ${PORT}`);
});