const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:tahun', async (req, res) => {
  const { tahun } = req.params;
  const url = `${aniUrl}/musim/${tahun}/`;

  console.log('Fetching URL:', url);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    console.log('Response received');

    const html = response.data;
    const $ = cheerio.load(html);

    // Update all hrefs starting with aniUrl
    $(`a[href^="${aniUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(aniUrl, ''));
    });
    // Ambil semua elemen <img>
$('img').each((_, el) => {
    // Ambil src dari gambar
    let src = $(el).attr('src') || '';

    // Ganti bagian dari src yang sesuai
    if (src.includes('tv.animisme.net/wp-content/uploads')) {
        src = src.replace('tv.animisme.net/wp-content/uploads', 'animasu.cc/wp-content/uploads');
        $(el).attr('src', src);
    }
});


    // Check if page structure is loaded correctly
    if (!$('.newseason').length) {
      throw new Error('Page structure has changed');
    }

    const musim = $('.newseason h1').text().trim();
    const results = [];

    $('.card').each((_, ele) => {
      const link = $(ele).find('.card-box a').attr('href') || '';
      const gambar = $(ele).find('.card-thumb img').attr('src') || '';
      const judul = $(ele).find('.card-title h2').text().trim() || '';
      const studio = $(ele).find('.card-title .studio').text().trim() || '';
      const episode = $(ele).find('.left span').first().text().trim() || '';
      const status = $(ele).find('.left .status').text().trim() || '';
      const alternatif = $(ele).find('.left .alternative').text().trim() || '';
      const rating = $(ele).find('.right.blue span').text().trim() || '';
      const deskripsi = $(ele).find('.desc p').text().trim() || '';
      const tags = $(ele).find('.card-info-bottom a').map((_, tagElement) => ({
        link: $(tagElement).attr('href'),
        tag: $(tagElement).text().trim()
      })).get();

      results.push({
        link,
        gambar,
        judul,
        studio,
        episode,
        status,
        alternatif,
        rating,
        deskripsi,
        tags
      });
    });

    console.log('Data parsed successfully');

    res.json({
      status: true,
      data: { musim, results }
    });
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.json({
      status: false,
      message: 'Terjadi kesalahan saat mengambil data.'
    });
  }
});

module.exports = router;
