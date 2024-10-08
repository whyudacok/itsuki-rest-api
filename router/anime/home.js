const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { aniUrl } = require('../base-url'); // Assume aniUrl is 'https://tv.animisme.net/'

router.get('/', async (req, res) => {
    const url = aniUrl; // Use aniUrl as the base URL

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const results = [];

        $('div.bsx').each((_, element) => {
            const article = $(element).closest('article.bs');
            let link = $(element).find('a').attr('href') || '';
            const jenis = $(element).find('div.typez').text().trim() || '';
            const judul = $(element).find('div.tt').text().trim() || '';
            let gambar = $(element).find('img').attr('src') || '';

            // Replace the domain in the image URL
            if (gambar) {
                gambar = gambar.replace('tv0.animisme.net/wp-content/uploads', 'animasu.cc/wp-content/uploads');
            }

            // Remove the domain part from the link
            link = link.replace(aniUrl, '');

            // Extract episode number from the link
            const episodeMatch = link.match(/episode-(\d+)/);
            const episode = episodeMatch ? episodeMatch[1] : '';

            results.push({
                link,
                jenis,
                judul,
                gambar,
                episode // Add episode info to the response
            });
        });

        res.json({
            status: true,
            data: {
                results: results.length > 0 ? results : [], // Ensure results is always an array
                totalPages: 0 // Total pages not computed; add if needed
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            data: {}, // Include empty data object
            message: 'Terjadi kesalahan saat mengambil data'
        });
    }
});

module.exports = router;
