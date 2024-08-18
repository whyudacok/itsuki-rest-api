const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:page', async (req, res) => {
    const { page } = req.params;
    const { genre = [], status, type, format, season, order, studio } = req.query;

    // Genre query string
    const genreStr = Array.isArray(genre) 
        ? genre.map((g, i) => `genre%5B${i}%5D=${g}`).join('&') 
        : genre ? `genre%5B0%5D=${genre}` : '';

    // Helper function to build query string
    const buildQuery = (key, value) => (value ? `${key}=${value}` : '');

    // Build query string
    const queryStr = [
        genreStr,
        buildQuery('status', status),
        buildQuery('type', type),
        buildQuery('format', format),
        buildQuery('season', season),
        buildQuery('order', order),
        buildQuery('studio', studio)
    ].filter(Boolean).join('&');

    const url = `${aniUrl}/anime/?page=${page}&${queryStr}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const $ = cheerio.load(response.data);

        // Clean href attributes
        $(`a[href^="${aniUrl}"]`).each((_, el) => {
            const href = $(el).attr('href');
            $(el).attr('href', href.replace(aniUrl, ''));
        });

        const results = [];

        $('div.listupd article.bs').each((_, el) => {
            results.push({
                link: $(el).find('div.bsx a').attr('href') || '',
                type: $(el).find('div.typez').text().trim() || '',
                episodes: $(el).find('span.epx').text().trim() || '',
                image: $(el).find('img').attr('src') || '',
                title: $(el).find('h2[itemprop="headline"]').text().trim() || ''
            });
        });

        const prevLink = $('.hpage a.l').attr('href') || '';
        const nextLink = $('.hpage a.r').attr('href') || '';

        const prevPage = prevLink.match(/page=(\d+)/) ? parseInt(prevLink.match(/page=(\d+)/)[1], 10) : null;
        const nextPage = nextLink.match(/page=(\d+)/) ? parseInt(nextLink.match(/page=(\d+)/)[1], 10) : null;

        const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim(), 10);

        res.json({
            status: true,
            results,
            totalPages,
            prevPage,
            nextPage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil data.' });
    }
});

module.exports = router;
