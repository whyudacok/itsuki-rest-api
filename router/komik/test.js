// routes/komik.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/scrape', async (req, res) => {
    try {
        // Menggunakan User-Agent untuk menghindari error 403
        const response = await axios.get('https://komikcast.cz/', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'DNT': '1', // Do Not Track Request Header
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
});


        const html = response.data;
        const $ = cheerio.load(html);
        const results = [];

        // Mengambil data dari elemen HTML yang diinginkan
        $('.utao').each((index, element) => {
            const title = $(element).find('h3').text();
            const image = $(element).find('img').attr('data-src');
            const link = $(element).find('a.series').attr('href');
            const chapters = [];

            $(element).find('.Manhwa li').each((i, el) => {
                const chapterTitle = $(el).find('a').text();
                const chapterLink = $(el).find('a').attr('href');
                const timestamp = $(el).find('span i').text();

                chapters.push({ chapterTitle, chapterLink, timestamp });
            });

            results.push({ title, image, link, chapters });
        });

        res.json(results);
    } catch (error) {
        console.error("Error scraping data", error);
        res.status(500).json({ message: "Error scraping data", error });
    }
});

module.exports = router;
