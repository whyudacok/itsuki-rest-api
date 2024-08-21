const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/scrape-div', async (req, res) => {
  const url = 'https://157.230.44.16/';

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Ambil elemen dengan class 'gmr-slider-content'
    const movieDiv = $('.gmr-slider-content');

    // Scraping data dari elemen tersebut
    const title = movieDiv.find('.gmr-slide-title a').text().trim();
    const link = movieDiv.find('.gmr-slide-title a').attr('href');
    const imageUrl = movieDiv.find('img').attr('data-src');
    const quality = movieDiv.find('.gmr-quality-item a').text().trim();

    // Format data yang akan dikembalikan
    const movieData = {
      title,
      link,
      imageUrl,
      quality
    };

    res.json({
      status: true,
      data: movieData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      data: {
        message: 'Terjadi kesalahan saat mengambil data.',
        error: error.message
      }
    });
  }
});

module.exports = router;
