const axios = require('axios');
const Redis = require('redis');

const redisClient = Redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379
  }
});

redisClient.on('error', err => console.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

const getCachedImage = async () => {
  try {
    const metadata = await redisClient.get('image:metadata');
    if (metadata) {
      const parsed = JSON.parse(metadata);
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (currentTime - parsed.timestamp < oneHour) {
        return;
      }
    }
  } catch (err) {
    console.error('Error reading metadata:', err);
  }

  await refreshImage();
};

const refreshImage = async () => {
  try {
    const response = await axios.get('https://picsum.photos/1200', { 
      responseType: 'arraybuffer' 
    });

    // Convert image to base64 and store in Redis
    const imageBase64 = Buffer.from(response.data).toString('base64');
    await redisClient.set('image:data', imageBase64);

    // Save metadata
    const metadata = { timestamp: Date.now() };
    await redisClient.set('image:metadata', JSON.stringify(metadata));

  } catch (err) {
    console.error('Error refreshing the image:', err);
  }
};

const removeCachedImage = async () => {
  try {
    await redisClient.del('image:data');
    await redisClient.del('image:metadata');
  } catch (err) {
    console.error('Error removing cached image:', err);
  }
};

const getImage = async () => {
  try {
    const imageData = await redisClient.get('image:data');
    return Buffer.from(imageData, 'base64');
  } catch (err) {
    console.error('Error getting image:', err);
    return null;
  }
};

process.on('SIGTERM', async () => {
  try {
    await redisClient.quit();
    console.log('Redis connection closed');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
});

module.exports = { getCachedImage, removeCachedImage, getImage };