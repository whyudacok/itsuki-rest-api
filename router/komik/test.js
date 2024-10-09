const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = 'https://komikcast.cz/';
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      proxy: {
        host: '189.41.83.62',
        port: 1080,
        auth: {
          username: 'YOUR_PROXY_USERNAME', // jika diperlukan
          password: 'YOUR_PROXY_PASSWORD'  // jika diperlukan
        }
      }
    });

    const $ = cheerio.load(data);
    const komikData = [];

    $('.utao').each((i, el) => {
      const title = $(el).find('.luf h3').text().trim();
      const link = $(el).find('.luf a').attr('href');
      const img = $(el).find('.imgu img').attr('data-src') || $(el).find('.imgu img').attr('src');
      const chapters = [];

      $(el).find('.luf ul li').each((i, chapterEl) => {
        const chapterLink = $(chapterEl).find('a').attr('href');
        const chapterTitle = $(chapterEl).find('a').text().trim();
        const chapterTime = $(chapterEl).find('span i').text().trim();
        chapters.push({ chapterTitle, chapterLink, chapterTime });
      });

      komikData.push({ title, link, img, chapters });
    });

    res.json(komikData);
  } catch (error) {
    res.status(500).json({ message: 'Error scraping data', error });
  }
});

module.exports = router;
