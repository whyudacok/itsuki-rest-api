const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { film } = require('../base-url');

router.get('/:page', async (req, res) => {
    const { page } = req.params;
    const { country, quality, movieyear, s, ...otherParams } = req.query;

 
    const buildQuery = (key, value) => (value ? `${key}=${encodeURIComponent(value)}` : '');

    // Membangun string kueri untuk parameter lain
    const selectedQueries = [
        buildQuery('country', country),
        buildQuery('quality', quality),
        buildQuery('movieyear', movieyear),
        buildQuery('s', s)
    ].filter(Boolean).join('&');

    // Buat string kueri untuk parameter lainnya
    const otherQueries = Object.entries(otherParams)
        .map(([key, value]) => buildQuery(key, value))
        .filter(Boolean)
        .join('&');

    // Gabungkan string kueri
    const queryString = [selectedQueries, otherQueries].filter(Boolean).join('&');
    const url = `${film}/page/${page}/?${queryString}`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('#gmr-main-load .item').each((_, element) => {
            results.push({
                title: $(element).find('.entry-title a').text().trim(),
                link: $(element).find('.entry-title a').attr('href'),
                gambar: $(element).find('.content-thumbnail img').attr('src'),
                rating: $(element).find('.gmr-rating-item').text().trim(),
                durasi: $(element).find('.gmr-duration-item').text().trim(),
                quality: $(element).find('.gmr-quality-item a').text().trim(),
                trailer: $(element).find('.gmr-popup-button a').attr('href') || null
            });
        });

        const pages = [];
        $('.pagination .page-numbers').each((_, element) => {
            const text = $(element).text().trim();
            if (text && !text.includes('…')) {
                pages.push(parseInt(text.replace(/,/g, ''), 10));
            }
        });

        const maxPage = pages.length ? Math.max(...pages) : 1;

        res.json({
            status: true,
            results,
            page: maxPage
        });
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({
            status: false,
            message: 'Error scraping data'
        });
    }
});

module.exports = router;
