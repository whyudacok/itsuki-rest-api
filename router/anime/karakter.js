const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:karakter/:page', async (req, res) => {
  const { karakter, page } = req.params;
  const url = `${aniUrl}/karakter/${karakter}/page/${page}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Ganti tautan dengan tautan relatif
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    const results = [];

    $('div.listupd article.bs').each((_, elemen) => {
      const tautan = $(elemen).find('div.bsx a').attr('href') || '';
      const jenis = $(elemen).find('div.typez').text().trim() || '';
      const episode = $(elemen).find('span.epx').text().trim() || '';
      const gambar = $(elemen).find('img').attr('src') || '';
      const judul = $(elemen).find('h2[itemprop="headline"]').text().trim() || '';

      results.push({
        tautan,
        jenis,
        episode,
        gambar,
        judul
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim(), 10);

    res.json({
      status: true,
      results,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      pesan: 'Terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
