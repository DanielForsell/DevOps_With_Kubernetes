const express = require('express');
const app = express();
const axios = require('axios');
const crypto = require('crypto');
const Redis = require('redis');

const PORT = process.env.PORT || 3000;

const redisClient = Redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379
  }
});

const connectToRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Successfully connected to Redis');
    }
    return true;
  } catch (err) {
    console.error('Redis connection failed:', err);
    return false;
  }
};

const initRedis = async () => {
  while (true) {
    const isConnected = await connectToRedis();
    if (isConnected) break;
    console.log('Retrying Redis connection in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

initRedis().catch(err => {
  console.error('Fatal error during Redis initialization:', err);
  process.exit(1);
});

app.get('/', async (req, res) => {
    try {
        console.log('Received a request to /');
        const pingpongres = await axios.get('http://ping-pong-app-svc:2346/pingpong');
        const randomString = crypto.randomUUID();
        const time = new Date().toISOString();

        const pingPongs = JSON.parse(await redisClient.get('pingpongs') || '[]');

        const newpinPong = {
            pingPongs: pingpongres.data.pingpong
        }
        pingPongs.push(newpinPong);
        await redisClient.set('pingpongs', JSON.stringify(pingPongs));

        console.log(`${time}: ${randomString}`, '\n', pingpongres.data.pingpong);
        res.status(200).send(`${time}: ${randomString}\nPing / Pongs: ${pingpongres.data.pingpong}`);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});