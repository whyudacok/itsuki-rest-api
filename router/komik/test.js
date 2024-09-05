const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route untuk scraping
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://meionovel.id/');
    const html = response.data;
    
    // Contoh ekstraksi data judul dari page
    // Cari elemen <h3 class="h5"> yang ada link judulnya
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
