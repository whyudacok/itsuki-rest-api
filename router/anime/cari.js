const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:endpoint/:page', async (req, res) => {
  const { endpoint, page } = req.params;
  const url = `${aniUrl}/page/${page}/?s=${encodeURIComponent(endpoint)}`;

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

    const animeList = $('div.listupd article.bs').map((_, el) => ({
      link: $(el).find('div.bsx a').attr('href') || '',
      jenis: $(el).find('div.typez').text().trim() || '',
      episode: $(el).find('span.epx').text().trim() || '',
      gambar: $(el).find('img').attr('src') || '',
      judul: $(el).find('h2[itemprop="headline"]').text().trim() || ''
    })).get();

    const totalPagesText = $('.pagination a.page-numbers').eq(-2).text().trim();
    const totalPages = totalPagesText ? parseInt(totalPagesText) : 0;

    res.json({
      status: true,
      data: { // Ensure `data` is always present
        result: animeList.length > 0 ? animeList : [],
        totalPages: totalPages || 0
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      data: {}, // Include empty data object
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
