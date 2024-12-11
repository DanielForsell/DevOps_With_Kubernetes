const express = require('express');
const path = require('path');
const images = require('../utils/image'); // Image utility module

const router = express.Router();

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'image.jpg');

// Route to serve the cached image
router.get('/', async (req, res) => {
  try {
    // Ensure the image is cached and valid
    await images.getCachedImage();

    // Send the image file to the client
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error fetching image');
      }
    });
  } catch (err) {
    console.error('Error in image route:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;