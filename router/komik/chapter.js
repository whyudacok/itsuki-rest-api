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
        'Referer': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    $(`a[href^="${baseUrl}"]`).each((_, el) => {
      const href = $(el).attr('href');
      $(el).attr('href', href.replace(baseUrl, ''));
    });

    const title = $('h1.entry-title').text().trim();
    const shortDescription = $('.short-description').text().trim(); // Get short description
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
    $('.box-list-chapter li').each((_, el) => {
      const chapterLink = $(el).find('a').attr('href');
      const chapterNumber = $(el).find('a').text().match(/\d+/)[0]; // Extract chapter number
      chapters.push({
        chapterText: `Chapter ${chapterNumber}`,
        chapterLink
      });
    });

    const data = {
      title,
      shortDescription, // Add short description
      prevChapterLink,
      nextChapterLink,
      downloadLink,
      images,
      thumbnail,
      chapters,
      allChaptersLink
    };

    // Send JSON response with status and success
    res.json({
      status: true,
      data
    });
  } catch (error) {
    // Send JSON response with status and error message
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
