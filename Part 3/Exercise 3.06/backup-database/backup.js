const Redis = require('redis');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

const redisClient = Redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379
  },
  retryStrategy: function(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const storage = new Storage({
  keyFilename: '/gcp/credentials.json'
});

async function backup() {
  try {
      // Connect to Redis
      await redisClient.connect();
      console.log('Connected to Redis');

      // Get all data from Redis
      const todos = await redisClient.get('todos');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupData = JSON.stringify({
          timestamp,
          data: JSON.parse(todos || '[]')
      });

      // Create backup file in Google Cloud Storage
      const bucket = storage.bucket(process.env.BUCKET_NAME);
      const file = bucket.file(`todos-backup-${timestamp}.json`);
      
      await file.save(backupData, {
          contentType: 'application/json',
          metadata: {
              sourceDatabase: process.env.REDIS_HOST,
              backupTime: timestamp
          }
      });

      console.log(`Backup todos-backup-${timestamp}.json completed successfully`);
      await redisClient.quit();
  } catch (error) {
      console.error('Backup failed:', error);
      process.exit(1);
  }
}

backup();