const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const router = express.Router();
const { baseUrl } = require('../base-url');

// Create a new cache instance with a TTL of 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${baseUrl}/${encodedEndpoint}/`;

  // Check if the data is in cache
  const cachedData = cache.get(url);
  if (cachedData) {
    return res.json(cachedData);
  }

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

    // Update all hrefs that start with the base URL
    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    const title = $('h1.entry-title').text().trim();
    const prevChapterLink = $('a[rel="prev"]').attr('href');
    const nextChapterLink = $('a[rel="next"]').attr('href');
    const downloadLink = $('.next-prev-box a[target="_blank"]').attr('href');
    const allChaptersLink = $('.next-prev-box a[href*="komik/"]').attr('href');

    const images = [];
    $('#anjay_ini_id_kh img').each((_, el) => {
      images.push($(el).attr('src'));
    });

    const thumbnail = $('.thumb img').attr('src');

    const chapters = [];
    $('.box-list-chapter li.list-chapter-chapter').each((_, el) => {
      const chapterText = $(el).find('a').text().trim();
      const chapterLink = $(el).find('a').attr('href');
      chapters.push({ chapterText, chapterLink });
    });

    const data = {
      title,
      prevChapterLink,
      nextChapterLink,
      downloadLink,
      images,
      thumbnail,
      chapters,
      allChaptersLink
    };

    // Cache the response data
    cache.set(url, data);

    res.json(data);
  } catch (error) {
    res.status(500).send('An error occurred while fetching the data.');
  }
});

module.exports = router;
