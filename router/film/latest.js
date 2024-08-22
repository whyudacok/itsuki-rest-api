const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { film } = require('../base-url');

router.get('/:page', async (req, res) => {
  const { page } = req.params;
  const url = `${film}/page/${page}/`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    $(`a[href^="${film}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(film, ''));
    });

    const results = [];
    $('#gmr-main-load .item').each((_, el) => {
      results.push({
        title: $(el).find('.entry-title a').text().trim(),
        link: $(el).find('.entry-title a').attr('href'),
        gambar: $(el).find('.content-thumbnail img').attr('src'),
        rating: $(el).find('.gmr-rating-item').text().trim(),
        durasi: $(el).find('.gmr-duration-item').text().trim(),
        quality: $(el).find('.gmr-quality-item a').text().trim()
      });
    });

    const pages = [];
    $('.pagination .page-numbers').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !text.includes('…')) {
        pages.push(parseInt(text.replace(/,/g, ''), 10));
      }
    });

    const page = Math.max(...pages, 1);

    res.json({
      status: true,
      results,
      page
    });
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({
      status: false,
      message: ' terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
