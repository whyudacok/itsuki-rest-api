const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/video', async (req, res) => {
  const url = 'https://www.blogger.com/video.g?token=AD6v5dzcct5iKrANUoHX6cwpacIm3w608g5Fa9p5yjBimrAIaDfJWHgIgEIHSY76b-VR1tCRvE0NfouWOn-KpVl2gV6tahNGW4Q2x0U5LXNpWtqP409iAufG6dvQuiFY_0NicNC84V8';

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Cari script yang berisi VIDEO_CONFIG
    const scriptContent = $('script').filter((i, script) => {
      return $(script).html().includes('VIDEO_CONFIG');
    }).html();

    // Ekstrak VIDEO_CONFIG dari script content
    const videoConfigMatch = scriptContent.match(/var VIDEO_CONFIG = ({.*?});/);
    if (videoConfigMatch) {
      const videoConfig = JSON.parse(videoConfigMatch[1]);
      const videoUrls = videoConfig.streams.map(stream => stream.play_url);
      res.json({ status: true, videoUrls });
    } else {
      res.status(404).json({ status: false, message: 'VIDEO_CONFIG tidak ditemukan.' });
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil URL:', error);
    res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil URL.' });
  }
});

module.exports = router;
