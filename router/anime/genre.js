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

    const $ = cheerio.load(response.data);

    // Update all hrefs starting with aniUrl
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });

    // Extract anime data
    const animeList = $('div.listupd article.bs').map((_, el) => ({
      link: $(el).find('div.bsx a').attr('href') || '',
      jenis: $(el).find('div.typez').text().trim() || '',
      episode: $(el).find('span.epx').text().trim() || '',
      gambar: $(el).find('img').attr('src') || '',
      judul: $(el).find('h2[itemprop="headline"]').text().trim() || ''
    })).get();

    // Extract total pages
    const totalPagesText = $('.pagination a.page-numbers').eq(-2).text().trim();
    const totalPages = totalPagesText ? parseInt(totalPagesText, 10) : 0;

    res.json({
      status: true,
      result: animeList.length > 0 ? animeList : [],
      totalPages
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      data: {},  // Include empty data object as per your requirements
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
