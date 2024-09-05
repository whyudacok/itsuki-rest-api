const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Fungsi untuk scraping
async function scrapeData() {
  try {
    const { data } = await axios.get('https://meionovel.id/');
    const $ = cheerio.load(data);
    const results = [];

    $('.page-listing-item').each((i, element) => {
      const title = $(element).find('.post-title a').text().trim();
      const rating = $(element).find('.post-total-rating .score').text().trim();
      const chapter = $(element).find('.list-chapter .chapter a').first().text().trim();
      const chapterUrl = $(element).find('.list-chapter .chapter a').first().attr('href');
      const imageUrl = $(element).find('.item-thumb img').attr('src');
      const lastUpdate = $(element).find('.post-on').first().text().trim();

      results.push({
        title,
        rating,
        chapter,
        chapterUrl,
        imageUrl,
        lastUpdate
      });
    });

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Route untuk menampilkan hasil scraping
router.get('/', async (req, res) => {
  const data = await scrapeData();
  res.json(data);
});

module.exports = router;
