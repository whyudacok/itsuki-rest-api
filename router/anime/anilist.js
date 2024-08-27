const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:page', async (req, res) => {
  const page = parseInt(req.params.page, 10);
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

    // Update all hrefs that start with aniUrl
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


    const results = $('div.listupd article.bs').map((_, element) => ({
      link: $(element).find('div.bsx a').attr('href') || '',
      jenis: $(element).find('div.typez').text().trim() || '',
      episode: $(element).find('span.epx').text().trim() || '',
      gambar: $(element).find('img').attr('src') || '',
      judul: $(element).find('h2[itemprop="headline"]').text().trim() || ''
    })).get();

    // Handle pagination
    const totalPages = parseInt($('div.pagination a.page-numbers').eq(-2).text().trim(), 10) || 0;

    // Directly return response data
    const responseData = {
      success: true,
      data: {
        results,
        totalPages
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      data: {},
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
});

module.exports = router;
