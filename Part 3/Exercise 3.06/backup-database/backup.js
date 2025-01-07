const Redis = require('ioredis');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

const REDIS_HOST = process.env.REDIS_HOST || 'redis-service';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const BUCKET_NAME = process.env.BUCKET_NAME;

const redis = new Redis({
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

const storage = new Storage({
  keyFilename: '/gcp/credentials.json'
});

async function backup() {
  try {
    // Ensure Redis connection
    await redis.ping();
    console.log('Connected to Redis');

    // Trigger Redis SAVE command
    const saveResult = await redis.save();
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
    await redis.quit();
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backup();