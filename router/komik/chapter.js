const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { baseUrl } = require('../base-url');

router.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `${baseUrl}/${encodedEndpoint}/`;

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
      chapters.push({
        chapterText: $(el).find('a').text().trim(),
        chapterLink: $(el).find('a').attr('href')
      });
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

    res.json(data);
  } catch (error) {
    res.status(500).send('An error occurred while fetching the data.');
  }
});

module.exports = router;
