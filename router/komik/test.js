const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route untuk scraping
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://meionovel.id/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    const html = response.data;
    
    // Contoh ekstraksi data judul dari page
    const regex = /<h3 class="h5">.*?<a href=".*?">(.*?)<\/a>/g;
    let titles = [];
    let match;

    // Loop untuk menemukan semua judul
    while ((match = regex.exec(html)) !== null) {
      titles.push(match[1]);
    }

    res.json({
      titles: titles
    });

  } catch (error) {
    res.status(500).send('Error fetching page: ' + error.message);
  }
});

module.exports = router;
