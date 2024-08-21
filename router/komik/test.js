const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Rute untuk scraping data artikel
router.get('/:page', async (req, res) => {
  const { page } = req.params;
  const url = `https://157.230.44.16/page/${page}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Ambil data artikel
    const articles = [];
    $('#gmr-main-load .item').each((index, element) => {
      const title = $(element).find('.entry-title a').text().trim();
      const link = $(element).find('.entry-title a').attr('href');
      const imageUrl = $(element).find('.content-thumbnail img').attr('src');
      const rating = $(element).find('.gmr-rating-item').text().trim();
      const duration = $(element).find('.gmr-duration-item').text().trim();
      const quality = $(element).find('.gmr-quality-item a').text().trim();

      articles.push({
        title,
        link,
        imageUrl,
        rating,
        duration,
        quality
      });
    });

    // Ambil informasi pagination
    const pagination = [];
    $('.pagination .page-numbers').each((index, element) => {
      const text = $(element).text().trim();
      const href = $(element).attr('href');
      if (text && !text.includes('…')) {
        let pageNumber = parseInt(text.replace(/,/g, ''), 10);
        pagination.push({
          page: pageNumber,
          url: href
        });
      }
    });

    // Temukan nomor halaman tertinggi
    const highestPageNumber = Math.max(...pagination.map(p => p.page));

    // Kirim respon JSON dengan data artikel dan informasi pagination
    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          highestPageNumber
        }
      }
    });
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({
      success: false,
      message: 'Error scraping data'
    });
  }
});

module.exports = router;
