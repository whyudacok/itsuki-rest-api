const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { baseUrl } = require('../base-url');

const cache = new NodeCache({ stdTTL: 600 }); // TTL 600 detik atau 10 menit

router.get('/:genre/:page', async (req, res) => {
  const { genre, page } = req.params;
  const cacheKey = `genre_${genre}_page_${page}`;

  // Cek apakah data sudah ada di cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json({ success: true, data: cachedData });
  }

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

    // Update semua href yang diawali dengan base URL
    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    const mangaList = [];
    $('.post-item-box').each((_, el) => {
      const link = $(el).find('a').attr('href');
      const jenis = $(el).find('.flag-country-type').attr('class').split(' ').pop();
      const gambar = $(el).find('.post-item-thumb img').attr('src');
      const judul = $(el).find('.post-item-title h4').text().trim();
      const nilai = $(el).find('.rating i').text().trim();
      const warna = $(el).find('.color-label-manga').text().trim();

      mangaList.push({
        link,
        jenis,
        gambar,
        judul,
        nilai,
        warna
      });
    });

    const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    const responseData = {
      success: true,
      data: {
        mangaList,
        totalPages
      }
    };

    // Simpan data ke cache selama 10 menit
    cache.set(cacheKey, responseData.data);

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data.' });
  }
});

module.exports = router;
