const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url');

router.get('/:page', async (req, res) => {
    const { page } = req.params;
    const { genre = [], status, type, format, season, order, studio } = req.query;

    // Helper function to build query string
    const buildQueryString = (key, value) => value ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` : '';

    // Build query string
    const genreStr = Array.isArray(genre) ? genre.map((g, i) => `genre%5B${i}%5D=${encodeURIComponent(g)}`).join('&') : '';
    const queryStr = [
        genreStr,
        buildQueryString('status', status),
        buildQueryString('type', type),
        buildQueryString('format', format),
        buildQueryString('season', season),
        buildQueryString('order', order),
        buildQueryString('studio', studio)
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

        // Extract results
        const results = $('div.listupd article.bs').map((_, el) => ({
            link: $(el).find('div.bsx a').attr('href') || '',
            type: $(el).find('div.typez').text().trim() || '',
            episodes: $(el).find('span.epx').text().trim() || '',
            gambar: $(el).find('img').attr('src') || '',
            judul: $(el).find('h2[itemprop="headline"]').text().trim() || ''
        })).get();

        // Extract pagination info
        const extractPageNumber = (link) => link ? parseInt(link.match(/page=(\d+)/)?.[1], 10) : null;
        const prevPage = extractPageNumber($('.hpage a.l').attr('href'));
        const nextPage = extractPageNumber($('.hpage a.r').attr('href'));
        const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim(), 10);

        res.json({
            status: true,
            data: {
                results,
                totalPages,
                prevPage,
                nextPage
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil data.' });
    }
});

module.exports = router;
