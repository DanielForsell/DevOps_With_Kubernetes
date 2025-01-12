const express = require('express');
const images = require('../utils/image');


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await images.getCachedImage();
    const imageBuffer = await images.getImage();
    
    if (!imageBuffer) {
      throw new Error('Image not found in Redis');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Error in image route:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;