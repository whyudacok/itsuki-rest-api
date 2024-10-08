// routes/komikTerbaru.js
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const latestkomik = [];
    $('.post-item-box').each((_, el) => {
      latestkomik.push({
        link: $(el).find('a').attr('href'),
        type: $(el).find('.flag-country-type').attr('class').split(' ').pop(),
        gambar: $(el).find('.post-item-thumb img').attr('src'),
        Title: $(el).find('.post-item-title h4').text().trim(),
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

    res.status(200).json({
      status: true,
      data
    });
  } catch (error) {
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
