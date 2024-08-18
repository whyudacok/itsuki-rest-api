const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:genre/:page', async (req, res) => {
  const { genre, page } = req.params;
  const url = `${aniUrl}/genre/${genre}/page/${page}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    const animeList = [];

    $('div.listupd article.bs').each((_, el) => {
      const link = $(el).find('div.bsx a').attr('href') || '';
      const jenis = $(el).find('div.typez').text().trim() || '';
      const episode = $(el).find('span.epx').text().trim() || '';
      const gambar = $(el).find('img').attr('src') || '';
      const judul = $(el).find('h2[itemprop="headline"]').text().trim() || '';

      animeList.push({
        link,
        jenis,
        episode,
        gambar,
        judul
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim()) || 0;

    res.json({
      status: true,
      result: animeList,
      totalPages
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
