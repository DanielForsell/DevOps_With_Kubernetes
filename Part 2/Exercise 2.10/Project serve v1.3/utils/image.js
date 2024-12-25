const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const axios = require('axios');

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'image.jpg');
const metadataPath = path.join(directory, 'metadata.json');

const getCachedImage = async () => {
  try {
    const metadata = JSON.parse(await fsPromises.readFile(metadataPath, 'utf-8'));
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;

    // If the image is still valid, do nothing
    if (currentTime - metadata.timestamp < oneHour) {
      return;
    }
  } catch (err) {
    console.error('Error reading metadata:', err);
  }

  // Refresh the image if metadata doesn't exist or is outdated
  await refreshImage();
};

const refreshImage = async () => {
  try {
    await fsPromises.mkdir(directory, { recursive: true });

    const response = await axios.get('https://picsum.photos/1200', { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const metadata = { timestamp: Date.now() };
    await fsPromises.writeFile(metadataPath, JSON.stringify(metadata), 'utf-8');
  } catch (err) {
    console.error('Error refreshing the image:', err);
  }
};

const removeCachedImage = async () => {
  try {
    await fsPromises.unlink(filePath);
    await fsPromises.unlink(metadataPath);
  } catch (err) {
    console.error('Error removing cached image or metadata:', err);
  }
};

module.exports = { getCachedImage, removeCachedImage };