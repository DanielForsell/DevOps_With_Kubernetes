const path = require('path');
const fs = require('fs/promises');
const axios = require('axios');

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'image.jpg');
const metadataPath = path.join(directory, 'metadata.json');

const getCachedImage = async () => {
  try {
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;

    
    if (currentTime - metadata.timestamp < oneHour) {
      return;
    }
  } catch (err) {
    
  }

  await refreshImage();
};

const refreshImage = async () => {

  await fs.mkdir(directory, { recursive: true });

  const response = await axios.get('https://picsum.photos/1200', { responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  const metadata = { timestamp: Date.now() };
  await fs.writeFile(metadataPath, JSON.stringify(metadata), 'utf-8');
};

const removeCachedImage = async () => {
  try {
    await fs.unlink(filePath);
    await fs.unlink(metadataPath);
  } catch (err) {

  }
};

module.exports = { getCachedImage, removeCachedImage };