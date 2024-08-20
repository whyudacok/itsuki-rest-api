const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { baseUrl } = require('../base-url');

router.get('/:genre/:page', async (req, res) => {
  const { genre, page } = req.params;
  const url = `${baseUrl}/genres/${genre}/page/${page}/`;

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

    const results = [];
    $('.post-item-box').each((_, el) => {
      results.push({
        link: $(el).find('a').attr('href'),
        jenis: $(el).find('.flag-country-type').attr('class').split(' ').pop(),
        gambar: $(el).find('.post-item-thumb img').attr('src'),
        judul: $(el).find('.post-item-title h4').text().trim(),
        nilai: $(el).find('.rating i').text().trim(),
        warna: $(el).find('.color-label-manga').text().trim()
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    res.json({
      success: true,
      data: {
        results,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data.' });
  }
});

module.exports = router;
