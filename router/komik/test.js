const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = 'https://senatorpeters.com/';

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const metaTitle = $('title').text().trim(); // Extract meta title

    const data = {
      metaTitle
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
