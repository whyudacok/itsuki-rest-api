const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { aniUrl } = require('../base-url');

// Inisialisasi cache dengan TTL 10 menit
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:page', async (req, res) => {
  const page = parseInt(req.params.page, 10);
  const cacheKey = `anime_page_${page}`;

  // Cek apakah data sudah ada di cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const url = page === 1
    ? `${aniUrl}/anime/?status=&type=&order=update`
    : `${aniUrl}/anime/?page=${page}&status=&type=&order=update`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Update semua href yang diawali dengan aniUrl
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    const animeList = [];
    $('div.listupd article.bs').each((index, element) => {
      const link = $(element).find('div.bsx a').attr('href') || '';
      const jenis = $(element).find('div.typez').text().trim() || '';
      const episode = $(element).find('span.epx').text().trim() || '';
      const gambar = $(element).find('img').attr('src') || '';
      const judul = $(element).find('h2[itemprop="headline"]').text().trim() || '';

      animeList.push({
        link,
        jenis,
        episode,
        gambar,
        judul
      });
    });

    // Handle pagination
    const totalPages = parseInt($('div.pagination a.page-numbers').eq(-2).text().trim(), 10) || 0;

    const responseData = {
      status: true,
      animeList,
      totalPages
    };

    // Simpan data ke cache selama 10 menit
    cache.set(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
