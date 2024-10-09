const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Route untuk scraping data dari Komikcast
router.get('/', async (req, res) => {
  const url = 'https://komikcast.cz/';
  try {
    // Lakukan permintaan ke halaman Komikcast
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Array untuk menyimpan hasil scraping
    const komikData = [];

    // Selector berdasarkan struktur HTML yang diberikan
    $('.utao').each((i, el) => {
      const title = $(el).find('.luf h3').text().trim();
      const link = $(el).find('.luf a').attr('href');
      const img = $(el).find('.imgu img').attr('data-src') || $(el).find('.imgu img').attr('src');
      const chapters = [];

      // Mendapatkan informasi chapter
      $(el)
        .find('.luf ul li')
        .each((i, chapterEl) => {
          const chapterLink = $(chapterEl).find('a').attr('href');
          const chapterTitle = $(chapterEl).find('a').text().trim();
          const chapterTime = $(chapterEl).find('span i').text().trim();
          chapters.push({ chapterTitle, chapterLink, chapterTime });
        });

      // Simpan data komik dalam array
      komikData.push({ title, link, img, chapters });
    });

    // Kirim hasil scraping sebagai respons JSON
    res.json(komikData);
  } catch (error) {
    res.status(500).json({ message: 'Error scraping data', error });
  }
});

module.exports = router;
