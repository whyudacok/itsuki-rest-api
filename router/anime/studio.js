const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { aniUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 30 menit (1800 detik)
const cache = new NodeCache({ stdTTL: 1800 });

router.get('/:studio/:page?', async (req, res) => {
  const { studio, page = 1 } = req.params;
  const encodedStudio = encodeURIComponent(studio);
  const cacheKey = `studio_${encodedStudio}_page_${page}`;
  const url = `${aniUrl}/studio/${encodedStudio}/page/${page}/`;

  // Cek cache terlebih dahulu
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Cache hit for:', cacheKey);
    return res.json({
      status: true,
      data: cachedData
    });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Mengganti href dalam halaman yang di-scrape
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
        image: $(el).find('img').attr('src') || '',
        title: $(el).find('h2[itemprop="headline"]').text().trim() || ''
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim(), 10);

    const data = {
      result,
      totalPages
    };

    // Simpan data ke cache
    cache.set(cacheKey, data);

    res.json({
      status: true,
      data
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: 'Error occurred while scraping data'
    });
  }
});

module.exports = router;
