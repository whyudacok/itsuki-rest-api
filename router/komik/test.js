const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:endpoint', async (req, res) => {
  const url = `https://157.230.44.16/${req.params.endpoint}/`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const $ = cheerio.load(data);

    const iframe = $('.gmr-embed-responsive iframe').attr('src') || '';
    const img = $('.gmr-movie-data img').attr('src') || '';
    const title = $('.gmr-movie-data-top h1.entry-title').text().trim() || '';
    const desc = $('.entry-content p').text().trim() || '';

    const info = {};
    $('.gmr-moviedata').each((_, el) => {
      const key = $(el).find('strong').text().replace(':', '').trim().toLowerCase();
      const value = $(el).find('span, a, time').text().trim() || '';
      info[key] = value;
    });

    res.json({
      success: true,
      data: { iframe, img, title, desc, info }
    });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengikis data.'
    });
  }
});

module.exports = router;
