const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:studio/:page?', async (req, res) => {
  const { studio, page = 1 } = req.params;
  const encodedStudio = encodeURIComponent(studio);
  const url = `${aniUrl}/studio/${encodedStudio}/page/${page}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Normalize href links
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    const result = [];

    $('div.listupd article.bs').each((_, el) => {
      result.push({
        link: $(el).find('div.bsx a').attr('href') || '',
        type: $(el).find('div.typez').text().trim() || '',
        episodes: $(el).find('span.epx').text().trim() || '',
        gambar: $(el).find('img').attr('src') || '',
        judul: $(el).find('h2[itemprop="headline"]').text().trim() || ''
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim(), 10);

    res.json({
      status: true,
      data: {
        results,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengikis data.'
    });
  }
});

module.exports = router;
