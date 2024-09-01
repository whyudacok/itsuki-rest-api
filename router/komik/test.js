const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = 'https://playerwish.com/e/w956ay1hjumb';

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Find the video element and extract the src attribute
    const videoSrc = $('video.jw-video').attr('src');

    if (videoSrc) {
      res.json({
        status: true,
        src: videoSrc
      });
    } else {
      res.json({
        status: false,
        message: 'Video source not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching video source',
      error: error.message
    });
  }
});

module.exports = router;
