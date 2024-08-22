const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:page', async (req, res) => {
    const { page } = req.params;
    const { country, quality, movieyear, s, ...otherParams } = req.query;

    // Membuat query string untuk parameter yang diambil
    const buildQuery = (key, value) => (value !== undefined && value !== '') ? `${key}=${encodeURIComponent(value)}` : '';

    // Query string untuk parameter yang diambil
    const selectedQueryString = [
        buildQuery('country', country),
        buildQuery('quality', quality),
        buildQuery('movieyear', movieyear),
        buildQuery('s', s)
    ].filter(Boolean).join('&');

    // Query string untuk parameter lainnya yang tidak diambil
    const otherQueryString = Object.entries(otherParams)
        .map(([key, value]) => buildQuery(key, value))
        .filter(Boolean)
        .join('&');

    // Gabungkan parameter yang diambil dan parameter lainnya
    const queryString = [otherQueryString, selectedQueryString].filter(Boolean).join('&');

    const url = `${baseUrl}/page/${page}/?${queryString}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);

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
      message: 'Error scraping data'
    });
  }
});

module.exports = router;
