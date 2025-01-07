const Redis = require('redis');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

// Assuming environment variables are set from the Kubernetes Secret
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const BUCKET_NAME = process.env.BUCKET_NAME;

const redisClient = Redis.createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
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
    // Ensure Redis connection
    await redisClient.connect();
    console.log('Connected to Redis');

    // Trigger Redis SAVE command
    const saveResult = await redisClient.save();
    console.log('SAVE command result:', saveResult);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = '/data/dump.rdb';
    
    // Verify file exists before upload
    if (!fs.existsSync(backupPath)) {
      throw new Error('dump.rdb not found at ' + backupPath);
    }
    
    const fileSize = fs.statSync(backupPath).size;
    console.log(`Backup file size: ${fileSize} bytes`);

    const destFileName = `redis-backup-${timestamp}.rdb`;

    // Upload to Google Cloud Storage with metadata
    await storage.bucket(BUCKET_NAME).upload(backupPath, {
      destination: destFileName,
      metadata: {
        contentType: 'application/octet-stream',
        metadata: {
          sourceDatabase: REDIS_HOST,
          backupTime: timestamp,
          fileSize: fileSize
        }
      }
    });

    console.log(`Backup ${destFileName} completed successfully`);
    await redisClient.quit();
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backup();