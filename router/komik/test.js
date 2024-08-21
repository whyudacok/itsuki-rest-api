const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = 'https://157.230.44.16/';

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Ambil data ikon sosial
    const socialIcons = {
      facebook: $('.share-facebook').attr('href'),
      twitter: $('.share-twitter').attr('href'),
      whatsapp: $('.share-whatsapp').attr('href'),
      telegram: $('.share-telegram').attr('href')
    };

    // Ambil data film
    const movies = [];
    $('.gmr-slider-content').each((index, element) => {
      const title = $(element).find('.gmr-slide-title a').text().trim();
      const link = $(element).find('.gmr-slide-title a').attr('href');
      const imageUrl = $(element).find('img').attr('data-src');
      const quality = $(element).find('.gmr-quality-item a').text().trim();

      movies.push({
        title,
        link,
        imageUrl,
        quality
      });
    });

    // Kirim respon JSON dengan data ikon sosial dan film
    res.json({
      status: true,
      socialIcons,
      movies
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data.',
      error: error.message
    });
  }
});

module.exports = router;
