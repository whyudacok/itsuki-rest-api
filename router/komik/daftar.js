const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { baseUrl } = require('../base-url');
const router = express.Router();

router.get('/:page', async (req, res) => {
  const page = req.params.page;
  const url = page === '1' ? `${baseUrl}/daftar-komik/` : `${baseUrl}/daftar-komik/page/${page}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Origin': baseUrl,
        'Cookie': '_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1',
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
      results.push({
        judul: $(el).find('.post-item-title h4').text().trim(),
        link: $(el).find('a').attr('href'),
        gambar: $(el).find('.post-item-thumb img').attr('src'),
        type: $(el).find('.flag-country-type').attr('class').split(' ').pop(),
        warna: $(el).find('.color-label-manga').text().trim(),
        nilai: $(el).find('.rating i').text().trim()
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    const responseData = {
      success: true,
      data: {
        results,
        totalPages
      }
    };

    // Kirim respons JSON ke client
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data.' });
  }
});

module.exports = router;
