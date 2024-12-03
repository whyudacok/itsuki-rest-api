const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { baseUrl } = require('../base-url');

router.get('/:page', async (req, res) => {
  const { page } = req.params;
  const url = `${baseUrl}/komik-terbaru/page/${page}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Origin': baseUrl,
        'Referer': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

const latestkomik = [];
$('.animepost').each((_, el) => {
  latestkomik.push({
    link: $(el).find('a').attr('href'),
    type: $(el).find('.typeflag').text().trim(),
    gambar: $(el).find('.limit img').attr('data-lazy-src') || $(el).find('.limit img').attr('src'), // Mengambil URL dari data-lazy-src atau src
    Title: $(el).find('.bigor .tt h4').text().trim(),
    chapter: {
      link: $(el).find('.lsch a').attr('href'),
      Title: $(el).find('.lsch a').text().trim(),
      Date: $(el).find('.datech').text().trim()
    }
  });
});



    const komikPopuler = [];
    $('.list-series-manga.pop li').each((_, el) => {
      komikPopuler.push({
        link: $(el).find('.thumbnail-series a.series').attr('href'),
        gambar: $(el).find('.thumbnail-series img').attr('src'),
        peringkat: $(el).find('.ctr').text().trim(),
        Title: $(el).find('h4 a.series').text().trim(),
        rating: $(el).find('.loveviews').text().trim()
      });
    });

    const Totalpages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    const data = {
      Totalpages,
      latestkomik,
      komikPopuler
    };

    // Kirim respons JSON ke client
    res.status(200).json({
      status: true,
      data
    });
  } catch (error) {
    // Kirim respons JSON dengan kesalahan
    res.status(500).json({
      status: false,
      data: {
        message: 'Terjadi kesalahan saat mengambil data.',
        error: error.message
      }
    });
  }
});

module.exports = router;
