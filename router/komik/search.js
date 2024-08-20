const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { baseUrl } = require('../base-url');

router.get('/:page', async (req, res) => {
    const { page } = req.params;
    const { genre = [], status, type, format, order, project, title } = req.query;

    let genreQuery = '';
    if (Array.isArray(genre)) {
        genreQuery = genre.map((g, index) => `genre%5B${index}%5D=${g}`).join('&');
    } else if (genre) {
        genreQuery = `genre%5B0%5D=${genre}`;
    }

    const buildQuery = (key, value) => (value !== undefined && value !== '') ? `${key}=${value}` : '';

    const queryString = [
        genreQuery,
        buildQuery('status', status),
        buildQuery('type', type),
        buildQuery('format', format),
        buildQuery('order', order),
        buildQuery('project', project),
        buildQuery('title', title)
    ].filter(Boolean).join('&');

    const url = `${baseUrl}/daftar-komik/page/${page}/?${queryString}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Origin': baseUrl,
                'Referer': baseUrl,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        $(`a[href^="${baseUrl}"]`).each((_, el) => {
            const href = $(el).attr('href');
            $(el).attr('href', href.replace(baseUrl, ''));
        });

        const results = [];
        $('.post-item-box').each((_, el) => {
            const link = $(el).find('a').attr('href');
            const type = $(el).find('.flag-country-type').attr('class').split(' ').pop();
            const gambar = $(el).find('.post-item-thumb img').attr('src');
            const judul = $(el).find('.post-item-title h4').text().trim();
            const nilai = $(el).find('.rating i').text().trim();
            const warna = $(el).find('.color-label-manga').text().trim();

            results.push({
                link,
                type,
                gambar,
                judul,
                nilai,
                warna
            });
        });

        const totalPages = parseInt($('.pagination a.page-numbers').eq(-2).text().trim());

        const responseData = {
            success: true,
            data: {
                results,
                totalPages
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data.' });
    }
});

module.exports = router;
