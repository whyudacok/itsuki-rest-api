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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Menghapus baseUrl dari link
    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    // Mengambil total halaman
    const Totalpages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

    // Mengambil data komik
    const komikList = [];
    $('.animepost').each((index, element) => {
      const title = $(element).find('.bigor .tt h4').text().trim();
      const url = $(element).find('a[itemprop="url"]').attr('href').replace(baseUrl, ''); // Menghapus baseUrl
      const image = $(element).find('img[itemprop="image"]').attr('src');
      const latestChapter = $(element).find('.adds .lsch a').text().trim();
      const chapterUrl = $(element).find('.adds .lsch a').attr('href').replace(baseUrl, ''); // Menghapus baseUrl
      const chapterDate = $(element).find('.adds .lsch .datech').text().trim();

      komikList.push({
        title,
        url,
        image,
        latestChapter,
        chapterUrl,
        chapterDate,
      });
    });

    const data = {
      Totalpages,
      komikList, // Menambahkan daftar komik
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
