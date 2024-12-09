const express = require('express');
const path = require('path');
const fs = require('fs');
const images = require('../utils/image'); // Your existing image utility module

const router = express.Router();

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'image.jpg');

// Route to serve the cached image
router.get('/', async (req, res) => {
  try {
    // Ensure the image file exists
    if (!fs.existsSync(filePath)) {
      await images.findAFile(); // Download a new image if necessary
    }
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