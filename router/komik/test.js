const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = 'https://nontonfilmgratis.club/';

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Ambil elemen dengan class 'col-md-125' dan itemtype 'https://schema.org/Movie'
    const movieDiv = $('.col-md-125[itemscope="itemscope"][itemtype="https://schema.org/Movie"]');

    // Scraping data dari elemen tersebut
    const title = movieDiv.find('h2.entry-title a').text().trim();
    const link = movieDiv.find('h2.entry-title a').attr('href');
    const imageUrl = movieDiv.find('img').attr('src');
    const rating = movieDiv.find('.gmr-rating-item').text().trim();
    const director = movieDiv.find('[itemprop="director"] [itemprop="name"]').text().trim();
    const quality = movieDiv.find('.gmr-quality-item').text().trim();

    // Format data yang akan dikembalikan
    const movieData = {
      title,
      link,
      imageUrl,
      rating,
      director,
      quality
    };

    res.json({
      status: true,
      data: movieData
    });
  } catch (error) {
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
