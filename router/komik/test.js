const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:endpoint', async (req, res) => {
  const url = `https://157.230.44.16/${req.params.endpoint}/`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const $ = cheerio.load(data);

    const iframe = $('.gmr-embed-responsive iframe').attr('src') || '';
    const img = $('.gmr-movie-data img').attr('src') || '';
    const title = $('.gmr-movie-data-top h1.entry-title').text().trim() || '';
    const desc = $('.entry-content p').text().trim() || '';

    const author = $('.gmr-moviedata .entry-author a').text().trim() || '';
    const postedOn = $('.gmr-moviedata time.entry-date.published').text().trim() || '';
    const tagline = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Tagline:')).text().replace('Tagline:', '').trim() || '';
    const genre = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Genre:')).find('a').text().trim() || '';
    const quality = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Quality:')).find('a').text().trim() || '';
    const year = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Year:')).find('a').text().trim() || '';
    const duration = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Duration:')).text().replace('Duration:', '').trim() || '';
    const country = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Country:')).find('a').map((_, el) => $(el).text().trim()).get().join(', ') || '';
    const releaseDate = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Release:')).text().replace('Release:', '').trim() || '';
    const language = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Language:')).text().replace('Language:', '').trim() || '';
    const revenue = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Revenue:')).text().replace('Revenue:', '').trim() || '';
    const director = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Director:')).find('a').text().trim() || '';
    const cast = $('.gmr-moviedata').filter((_, el) => $(el).text().includes('Cast:')).find('a').map((_, el) => $(el).text().trim()).get().join(', ') || '';

    res.json({
      success: true,
      data: {
        iframe,
        img,
        title,
        desc,
        author,
        postedOn,
        tagline,
        genre,
        quality,
        year,
        duration,
        country,
        releaseDate,
        language,
        revenue,
        director,
        cast
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengikis data.'
    });
  }
});

module.exports = router;
