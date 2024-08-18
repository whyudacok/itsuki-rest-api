const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { baseUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 10 menit
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:endpoint/:page', async (req, res) => {
  const { endpoint, page } = req.params;
  const url = `${baseUrl}/page/${page}/?s=${encodeURIComponent(endpoint)}`;

  // Cek apakah data sudah ada di cache
  const cachedData = cache.get(url);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'Origin': baseUrl,
        'Referer': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Update semua href yang diawali dengan base URL
    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    const results = [];
    $('.post-item-box').each((_, el) => {
      const link = $(el).find('a').attr('href');
      const type = $(el).find('.flag-country-type').attr('class').split(' ').pop();
      const image = $(el).find('.post-item-thumb img').attr('src');
      const title = $(el).find('.post-item-title h4').text().trim();
      const rating = $(el).find('.rating i').text().trim();
      const warna = $(el).find('.color-label-manga').text().trim();

      results.push({
        link,
        type,
        image,
        title,
        rating,
        warna
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    const data = {
      status: true,
      results,
      totalPages
    };

    // Simpan data ke cache
    cache.set(url, data);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
